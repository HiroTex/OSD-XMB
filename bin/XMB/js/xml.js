//////////////////////////////////////////////////////////////////////////
///*				   			   XML  							  *///
/// 				   		  										   ///
///		This script handles support for custom XML files for the	   ///
/// 				   		  	   app								   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

function xmlParseAttributes(attributesString)
{
    const attributes = {};
    let i = 0, len = attributesString.length;

    while (i < len)
    {
        // Skip leading whitespace
        while (i < len && attributesString.charCodeAt(i) <= 32) i++;

        // Break early if end of string after whitespace
        if (i >= len) { break; }

        // Find attribute name start
        let nameStart = i;
        while (i < len && attributesString.charCodeAt(i) !== 61) i++; // '='

        // Extract name (avoid multiple slice/trim calls)
        const nameEnd = i;
        while (nameEnd > nameStart && attributesString.charCodeAt(nameEnd - 1) <= 32) i--;
        const name = attributesString.slice(nameStart, nameEnd);

        // Skip '="'
        i += 2;

        // Find attribute value
        let valueStart = i;
        while (i < len && attributesString.charCodeAt(i) !== 34) i++; // '"'

        attributes[name] = attributesString.slice(valueStart, i);

        // Move past closing quote
        i++;
    }

    return attributes;
}
function xmlParseElement(xmlData)
{
    // Trim for performance-critical operations
    xmlData = xmlData.trim();

    // Quick self-closing tag check using direct string methods
    if (xmlData.charCodeAt(xmlData.length - 2) === 47)
    { // '/'
        const spaceIndex = xmlData.indexOf(' ');
        return {
            tagName: xmlData.slice(1, spaceIndex > -1 ? spaceIndex : -2),
            attributes: spaceIndex > -1 ? xmlParseAttributes(xmlData.slice(spaceIndex + 1, -2)) : {},
            children: []
        };
    }

    // Find tag boundaries using indexOf for speed
    const openTagEnd = xmlData.indexOf('>');
    const closeTagStart = xmlData.lastIndexOf('</');

    if (openTagEnd === -1 || closeTagStart === -1) return null;

    // Parse first tag
    const firstTag = xmlData.slice(1, openTagEnd);
    const spaceIndex = firstTag.indexOf(' ');

    const element = {
        tagName: spaceIndex > -1 ? firstTag.slice(0, spaceIndex) : firstTag,
        attributes: spaceIndex > -1 ? xmlParseAttributes(firstTag.slice(spaceIndex + 1)) : {},
        children: []
    };

    let body = xmlData.slice(openTagEnd + 1, closeTagStart).trim();

    const cdataStart = body.indexOf("<![CDATA[");
    if (cdataStart === 0)
    {
        const cdataEnd = body.indexOf("]]>", cdataStart);
        cdataEnd !== -1 && (element.cdata = body.slice(cdataStart + 9, cdataEnd));
        return element;
    }

    const childRegex = /<(\w+)([^>]*)\s*\/>|<(\w+)([^>]*)>([\s\S]*?)<\/\3>/g;
    let childMatch;

    while ((childMatch = childRegex.exec(body)) !== null)
    {
        const fullChildXML = childMatch[0];
        const child = xmlParseElement(fullChildXML);
        if (child)
        {
            element.children.push(child);
        }
    }

    return element;
}
function xmlGetLangObj(match)
{
    const keys = match[1].split('.'); // Split by dot to access nested properties
    let value = XMBLANG;

    for (const key of keys)
    {
        if (value && typeof value === 'object' && key in value)
        {
            value = value[key]; // Traverse the object
        }
        else
        {
            return ""; // Return null if any key is missing
        }
    }

    return value; // Return the found object (string array)
}
function xmlGetLocalizedString(element, attributeName)
{
    const tag = element.children.find(child => child.tagName === attributeName);
    if (tag)
    {
        return tag.children.map(child => child.attributes.str);
    }
    if (attributeName in element.attributes)
    {
        // Check if the attribute value is a language object (e.g. "{SOME_KEY}")
        const match = element.attributes[attributeName].match(/^\{(.+)\}$/);
        if (match) { return xmlGetLangObj(match); }
        return element.attributes[attributeName];
    }

    return "";
}
function xmlParseIcon(element)
{
    const match = element.match(/^\{(.+)\}$/);
    if (match) { return std.evalScript(match[1]); }
    else if (element.startsWith('#')) { return findDashIcon(element.slice(1)); }
    return parseInt(element);
}
function xmlParseElfTag(element)
{
    // Parse the ELF-specific Value tag
    const Value = {};

    const valueTag = element.children.find(child => child.tagName === "Value");
    if (valueTag)
    {
        Value.Path = valueTag.attributes.Path;
        Value.Args = ((valueTag.attributes.Args === undefined) || (valueTag.attributes.Args === "")) ? [] : valueTag.attributes.Args.split(",").map(arg => arg.trim());
    }

    return Value;
}
function xmlParseCodeTag(element)
{
    const codeTag = element.children.find(child => child.tagName === "Code");
    if (codeTag)
    {
        if ("filepath" in codeTag.attributes) { return codeTag.attributes.filepath; }
        else if ("cdata" in codeTag) { return std.evalScript(`(${codeTag.cdata})`); }
    }

    // No code tag found, return empty function
    return `()`;
}
function xmlParseDialogTag(element)
{
    msgInfo = {};
    msgInfo.Title = xmlGetLocalizedString(element, "Title");
    msgInfo.Icon = xmlParseIcon(element.attributes.Icon);
    msgInfo.BG = (element.attributes.BG === "true");
    msgInfo.Type = element.attributes.Type;

    // Iterate over all attributes and add them as properties of the component object
    for (const [name, value] of Object.entries(element.attributes))
    {
        // Skip the Name and Icon attributes since they're already handled
        if (name === "ConfirmBtn") { msgInfo.ENTER_BTN = (value === "true"); }
        if (name === "BackBtn") { msgInfo.BACK_BTN = (value === "true"); }
        if (name !== "Title" && name !== "Icon" && name !== "BG" && name !== "Type") { msgInfo[name] = value; }
    }

    element.children.forEach((child) =>
    {
        if ("cdata" in child) { msgInfo[child.tagName] = std.evalScript(`(${child.cdata})`); }
    });

    switch (msgInfo.Type)
    {
        case "TEXT":
            msgInfo.Text = xmlGetLocalizedString(element, "Text");
            const taskTag = element.children.find(child => child.tagName === "Task");
            if (taskTag)
            {
                if ("cdata" in taskTag) { msgInfo.BgFunction = std.evalScript(`(${taskTag.cdata})`); }
            }
            break;
        case "INFO":
            break;
        case "PARENTAL_SET":
            break;
        case "PARENTAL_CHECK":
            break;
    }

    return msgInfo;
}
function xmlParseContext(element)
{
    contextObj = {};
    contextObj.Options = [];
    let defaultGetter = false;

    element.children.forEach((child) =>
    {
        if (child.tagName === "Component")
        {
            const component = {};
            component.Name = xmlGetLocalizedString(child, "Name");
            component.Icon = xmlParseIcon(child.attributes.Icon);

            // Iterate over all attributes and add them as properties of the component object
            for (const [name, value] of Object.entries(child.attributes))
            {
                // Skip the Name and Icon attributes since they're already handled
                if (name !== "Name" && name !== "Icon") { component[name] = value; }
            }

            child.children.forEach((option) =>
            {
                if (option.tagName === "Dialog") { component[option.tagName] = xmlParseDialogTag(option); return; }
                if ("cdata" in option) { component[option.tagName] = std.evalScript(`(${option.cdata})`); return; }
            });

            contextObj.Options.push(component);
        }
        else if (child.tagName === "Default")
        {
            if ("Variable" in child.attributes)
            {
                const variableName = child.attributes.Variable;
                defaultGetter = () => std.evalScript(variableName);
            } else if ("cdata" in child)
            {
                contextObj.Default = std.evalScript(`(() => { ${child.cdata} })()`);
            }
        }
        else if (child.tagName.includes("Dialog")) { contextObj[child.tagName] = xmlParseDialogTag(child); }
        else if ("cdata" in child) { contextObj[child.tagName] = std.evalScript(`(${child.cdata})`); }
    });

    if (defaultGetter)
    {
        // Define Default as a getter function
        Object.defineProperty(contextObj, "Default", {
            get: () => defaultGetter(),
            enumerable: true
        });
    }

    if (!("Default" in contextObj)) { contextObj.Default = 0; }

    return contextObj;
}
function xmlParseSubMenu(element)
{
    const submenu = {};
    submenu.Options = [];

    element.children.forEach((option) =>
    {
        if (option.tagName === "Option")
        {
            if ("filepath" in option.attributes)
            {
                const optionObj = option.attributes.filepath;
                submenu.Options.push(optionObj);
                return;
            }

            const optionObj = {
                Name: xmlGetLocalizedString(option, "Name"),
                Description: xmlGetLocalizedString(option, "Description"),
                Type: option.attributes.Type,
                Icon: xmlParseIcon(option.attributes.Icon)
            };

            if (option.attributes.Type === "SUBMENU") { optionObj.Value = xmlParseSubMenu(option); }
            else if (option.attributes.Type === "CONTEXT") { optionObj.Value = xmlParseContext(option); }
            else if (option.attributes.Type === "CODE") { optionObj.Value = xmlParseCodeTag(option); }
            else if (option.attributes.Type === "ELF") { optionObj.Value = xmlParseElfTag(option); }

            submenu.Options.push(optionObj);
        }
    });

    submenu.Default = 0;
    return submenu;
}
function parseXmlPlugin(xmlString)
{
    const parsedData = xmlParseElement(xmlString);

    if (parsedData.tagName !== "App") { return {}; }

    const plugin = {
        Name: xmlGetLocalizedString(parsedData, "Name"),
        Description: xmlGetLocalizedString(parsedData, "Description"),
        Icon: xmlParseIcon(parsedData.attributes.Icon),
        Category: parseInt(parsedData.attributes.Category),
        Type: parsedData.attributes.Type
    };

    if (plugin.Type === "SUBMENU")
    {
        const optionsTag = parsedData.children.find(child => child.tagName === "Options");
        if (optionsTag)
        {
            plugin.Value = optionsTag.attributes.filepath;
            if (("required" in optionsTag.attributes) && (optionsTag.attributes.required === "true"))
            {
                plugin.Value = {};
                plugin.Value.Options = execScript(optionsTag.attributes.filepath);
                plugin.Value.Default = 0;
                if (plugin.Value.Options.length < 1) { return {}; }
            }
        }
        else { plugin.Value = xmlParseSubMenu(parsedData); }
    }
    else if (plugin.Type === "CONTEXT") { optionObj.Value = xmlParseContext(parsedData); }
    else if (plugin.Type === "ELF") { plugin.Value = xmlParseElfTag(parsedData); }
    else if (plugin.Type === "CODE") { plugin.Value = xmlParseCodeTag(parsedData); }

    // Check for CustomIcon and add it if present
    const customIconTag = parsedData.children.find(child => child.tagName === "CustomIcon");
    if (customIconTag) { plugin.CustomIcon = customIconTag.attributes.Path; }

    return plugin;
}

xmblog("INIT: XML INIT COMPLETE");
