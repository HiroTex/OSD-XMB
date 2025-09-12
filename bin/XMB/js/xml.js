//////////////////////////////////////////////////////////////////////////
///*				   			   XML  							  *///
/// 				   		  										   ///
///		This script handles support for custom XML files for the	   ///
/// 				   		  	   app								   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

function xmlParseAttributes(attributesString) {
    const attributes = {};
    let i = 0, len = attributesString.length;

    while (i < len) {
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
function xmlFindNextElementBlock(str) {
    const tagOpen = str.indexOf('<');
    if (tagOpen === -1 || str[tagOpen + 1] === '/') return null;

    const spaceOrClose = str.indexOf('>', tagOpen);
    if (spaceOrClose === -1) return null;

    const firstSpace = str.indexOf(' ', tagOpen);
    const tagEnd = (firstSpace > -1 && firstSpace < spaceOrClose) ? firstSpace : spaceOrClose;
    const tagName = str.slice(tagOpen + 1, tagEnd);

    const selfClose = str.slice(spaceOrClose - 1, spaceOrClose + 1) === '/>';
    if (selfClose) {
        const tagBlock = str.slice(tagOpen, spaceOrClose + 1);
        return [tagBlock, tagOpen + tagBlock.length];
    }

    // Tag is not self-closing — we must find its true end
    let depth = 1;
    let searchPos = spaceOrClose + 1;

    while (depth > 0) {
        const nextOpen = str.indexOf(`<${tagName}`, searchPos);
        const nextClose = str.indexOf(`</${tagName}>`, searchPos);

        if (nextClose === -1) return null;

        if (nextOpen !== -1 && nextOpen < nextClose) {
            const nextOpenEnd = str.indexOf(">", nextOpen);
            if (nextOpenEnd === -1) return null;

            // check if this inner <tag> is actually self-closing
            if (str.charCodeAt(nextOpenEnd - 1) === 47) {
                // self-closing — just skip, do not increment depth
                searchPos = nextOpenEnd + 1;
            } else {
                // real nested open — increase depth
                depth++;
                searchPos = nextOpenEnd + 1;
            }
        } else {
            depth--;
            searchPos = nextClose + tagName.length + 3;
        }
    }

    const tagBlock = str.slice(tagOpen, searchPos);
    return [tagBlock, tagOpen + tagBlock.length];
}
function xmlParseElement(xmlData) {
    // Trim for performance-critical operations
    xmlData = xmlData.trim();

    // Quick self-closing tag check using direct string methods ['/']
    if (xmlData.charCodeAt(xmlData.length - 2) === 47) {
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
    if (cdataStart === 0) {
        const cdataEnd = body.indexOf("]]>", cdataStart);
        cdataEnd !== -1 && (element.cdata = body.slice(cdataStart + 9, cdataEnd));
        return element;
    }

    let bodyCursor = 0;
	while (bodyCursor < body.length) {
		const result = xmlFindNextElementBlock(body.slice(bodyCursor));
		if (!result) break;

		const [childXML, length] = result;
		const child = xmlParseElement(childXML);
		if (child) element.children.push(child);
		bodyCursor += length;
	}

    return element;
}
function xmlGetLangObj(match) {
    const keys = match[1].split('.'); // Split by dot to access nested properties
    let value = XMBLANG;

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key]; // Traverse the object
        } // Return null if any key is missing
        else { return ""; }
    }

    return value; // Return the found object (string array)
}
function xmlDefineDefaultProperty(object, element) {
    let _getter = false;

	if ("Default" in element.attributes) {
		// return getter for code
        const match = element.attributes.Default.match(/^\{(.+)\}$/);
        if (match) { _getter = match[1]; }
		else {
			// Return Value if Integer
			const i = parseInt(element.attributes.Default);
			if (!isNaN(i)) { object.Default = i; }
		}
	}
	else {
		for (let i = 0; i < element.children.length; i++) {
			const child = element.children[i];
			if (child.tagName === "Default") {
                if ("Variable" in child.attributes) {
                    Object.defineProperty(object, "Default", {
                        get() { return eval(`Number(${child.attributes.Variable})`); },
                        enumerable: true,
                        configurable: true,
                    });
                }
				else if ("cdata" in child) { _getter = `(() => { ${child.cdata} })();`; }
			}
		}
	}

	if (_getter) {
        // Define Default as a getter function
        Object.defineProperty(object, "Default", {
            get() {	const value = eval(_getter); delete this.Default; this.Default = value; return value; },
            enumerable: true,
			configurable: true,
        });
    }

    if (!("Default" in object)) { object.Default = 0; }
}
function xmlDefineEvalProperty(object, property) {
	if (typeof object[property] === "string" && object[property].startsWith("$")) {
		const _getter = object[property].substring(1);
		Object.defineProperty(object, property, {
			get() {	return eval(_getter); },
			enumerable: true
		});
	}
}
function xmlGetLocalizedString(element, attributeName) {
    const tag = element.children.find(child => child.tagName === attributeName);
    if (tag) { return tag.children.map(child => child.attributes.str); }
    if (attributeName in element.attributes) {
		if (element.attributes[attributeName].startsWith("$")) {
			return element.attributes[attributeName];
		}

        // Check if the attribute value is a language object (e.g. "{SOME_KEY}")
        const match = element.attributes[attributeName].match(/^\{(.+)\}$/);
        if (match) { return xmlGetLangObj(match); }
        return element.attributes[attributeName];
    }

    return "";
}
function xmlGetObject(element, name) {
	const tag = element.children.find(child => child.tagName === name);
    if (tag) { return tag.children.map(child => child.attributes.value); }
    if (name in element.attributes) {
        // Check if the attribute value is a language object (e.g. "{SOME_KEY}")
        const match = element.attributes[name].match(/^\{(.+)\}$/);
        if (match) { const code = () => std.evalScript(match[1]); return code; }
        return element.attributes[name];
    }
}
function xmlParseIcon(element) {
	// Check for Executable code.
    const match = element.match(/^\{(.+)\}$/);
    if (match) { return eval(match[1]); }

	// Get Number or string
	const i = parseInt(element);
	if (isNaN(i)) { return element; }
	else { return i; }
}
function xmlParseElfTag(element) {
    // Parse the ELF-specific Value tag
    const Value = {};

    const valueTag = element.children.find(child => child.tagName === "Value");
    if (valueTag) {
        Value.Path = valueTag.attributes.Path;
        Value.Args = ((valueTag.attributes.Args === undefined) || (valueTag.attributes.Args === "")) ? [] : valueTag.attributes.Args.split(",").map(arg => arg.trim());
    }

    return Value;
}
function xmlParseCodeTag(element) {
    const scriptObj = {};
    const codeTag = element.children.find(child => child.tagName === "Code");
    if (codeTag) {
        if ("filepath" in codeTag.attributes) { scriptObj.filepath = codeTag.attributes.filepath; }
        else if ("cdata" in codeTag) { scriptObj.Code = std.evalScript(`(${codeTag.cdata})`); }
    }

    const att = Object.getOwnPropertyNames(element.attributes);
    for (let i = 0; i < att.length; i++) {
        const name = att[i];
        if (name in scriptObj) { continue; }
        else { scriptObj[name] = element.attributes[name]; }
    }

    // No code tag found, return empty function
    return scriptObj;
}
function xmlParseDialogTag(element) {
    console.log("xmlParseDialogTag(): Parsing Dialog...");
    if (!element.tagName.includes("Dialog")) {
        const codeTag = element.children.find(child => child.tagName === "Dialog");
        if (codeTag) { return xmlParseDialogTag(codeTag); }
        // No Dialog tag found, return empty object
        console.log("xmlParseDialogTag(): Default Dialog Tag not found.")
        return {};
    }

    const msgInfo = {};
    msgInfo.Title = xmlGetLocalizedString(element, "Title");
    msgInfo.BG = (element.attributes.BG === "true");
    msgInfo.Type = element.attributes.Type;
    msgInfo.Text = xmlGetLocalizedString(element, "Text");
    if ('Icon' in element.attributes) msgInfo.Icon = xmlParseIcon(element.attributes.Icon);

    // Iterate over all attributes and add them as properties of the component object
    for (const [name, value] of Object.entries(element.attributes)) {
        // Skip the Name and Icon attributes since they're already handled
		if (name in msgInfo) 		{ continue; }
        if (name === "ConfirmBtn") 	{ msgInfo.ENTER_BTN = (value === "true"); continue; }
        if (name === "BackBtn") 	{ msgInfo.BACK_BTN = (value === "true"); continue; }

		const parsed = parseInt(value);
		if (isNaN(parsed)) { msgInfo[name] = value; }
		else { msgInfo[name] = parsed; }
    }

	for (let i = 0; i < element.children.length; i++) {
		let child = element.children[i];
		if (child.tagName in msgInfo) { continue; }
		if (child.tagName === "Event") {
			if (('Type' in child.attributes) && ('On' in child.attributes)) {
				let event = false;

				switch (child.attributes.Type) {
					case "Transition":
						if (!('To' in child.attributes)) { continue; }
						event = function() {
							if ('Condition' in child.attributes) {
                                const condition = std.evalScript(child.attributes.Condition);

								if (!condition) {
									if (child.attributes.Exit) { UIAnimationDialogFade_Start(false); }
									return;
								}
                            }

                            let level = DashUI.Dialog.Level;

                            if ('From' in child.attributes) {
                                level = parseInt(child.attributes.From);
                            }

                            const prevData = DashUI.Dialog.Data[level];
                            DashUIDialogTransition(prevData[child.attributes.To]);
						}
						break;
				}

				if (!event) { continue; }
				msgInfo[child.attributes.On] = event;
			}
		}
        if ("cdata" in child) { msgInfo[child.tagName] = std.evalScript(`(${child.cdata})`); }
	}

    console.log("xmlParseDialogTag(): Parsing Dialog Type.");

    switch (msgInfo.Type) {
        case "TEXT":
            const taskTag = element.children.find(child => child.tagName === "Task");
            if (taskTag) {
                if ("cdata" in taskTag) { msgInfo.Fun = std.evalScript(`(${taskTag.cdata})`); }
            }
            break;
        case "INFO":
			const infoTag = element.children.find(child => child.tagName === "Info");
			if (infoTag) {
				msgInfo.Selected = -1;
				msgInfo.Info = [];
				infoTag.children.forEach((child) =>	{
					if (child.tagName !== "Item") { return; }
					const item = {};
					item.Selected = 0;
					item.Selectable = (child.attributes.Selectable === "true");
					item.Name = xmlGetLocalizedString(child, "Name");
					const value = xmlGetObject(child, "Value");
					if (typeof value === "function") {
						Object.defineProperty(item, "Value", {
							get: () => value(),
							enumerable: true
						});
					}
					else if (Array.isArray(value)) {
						for (let i = 0; i < value.length; i++) {
							const match = value[i].match(/^\{(.+)\}$/);
							if (match) { value[i] = xmlGetLangObj(match); }
						}
						item.Value = value;
					}
					else { item.Value = value; }
					if ((msgInfo.Selected === -1) && (item.Selectable)) { msgInfo.Selected = msgInfo.Info.length; }
					msgInfo.Info.push(item);
				});
			}
            break;
    }

    console.log("xmlParseDialogTag(): Parsing Named Childrens.");

	xmlParseNamedChildrens(element, msgInfo);

    console.log("xmlParseDialogTag(): Parse Dialog Finished.");
    return msgInfo;
}
function xmlParseContext(element) {
    console.log("xmlParseContext(): Parsing Context...");
    contextObj = {};
    contextObj.Items = [];
	xmlDefineDefaultProperty(contextObj, element);

	for (let i = 0; i < element.children.length; i++) {
		const child = element.children[i];
		if (child.tagName in contextObj) { continue; }
		if (child.tagName === "Component") {
            const component = {};
            component.Name = xmlGetLocalizedString(child, "Name");
            if ('Icon' in child.attributes) { component.Icon = xmlParseIcon(child.attributes.Icon); }

            // Iterate over all attributes and add them as properties of the component object
            console.log("xmlParseContext(): Parsing Component Attributes");
            for (const [name, value] of Object.entries(child.attributes)) {
                // Skip attributes that are already included
                if (!(name in component)) { component[name] = value; }
            }

            if (child.children && child.children.length > 0) {
                console.log("xmlParseContext(): Parsing Component Childrens");

                for (let j = 0; j < child.children.length; j++) {
                    const option = child.children[j];
                    if (option.tagName in component) { continue; }
                    if (option.tagName === "Dialog") { component[option.tagName] = xmlParseDialogTag(option); }
                    else if ("cdata" in option) { component[option.tagName] = std.evalScript(`(${option.cdata})`); }
                    else if ('attributes' in option) { component[option.tagName] = option.attributes; }
                }
            }

            console.log("xmlParseContext(): Parsed Component");
            contextObj.Items.push(component);
        }
		else if (child.tagName === "Components") {
            if ("cdata" in child) { contextObj.Items = std.evalScript(`(() => { ${child.cdata} })();`); }
			else if ("filepath" in child.attributes) { contextObj.Items = std.loadScript(child.attributes.filepath); }
		}
        else if (child.tagName.includes("Dialog")) { contextObj[child.tagName] = xmlParseDialogTag(child); }
        else if ("cdata" in child) { contextObj[child.tagName] = std.evalScript(`(${child.cdata})`); }
	}

    console.log("xmlParseContext(): Parsing Extra Attributes");
	const att = Object.getOwnPropertyNames(element.attributes);
	for (let i = 0; i < att.length; i++) {
		const name = att[i];
		if (name in contextObj) { continue; }
		else { contextObj[name] = element.attributes[name]; }
    }
    console.log("xmlParseContext(): Parsing Context Finished");
    return contextObj;
}
function xmlParseNamedChildrens(source, element) {
	for (let i = 0; i < source.children.length; i++) {
		const tagName = source.children[i].tagName;
		if (!('attributes' in source.children[i])) { continue; }
		if (!('Name' in source.children[i].attributes)) { continue; }
		if (!(source.children[i].attributes.Name in element)) {
			switch(tagName)	{
				case "Context": element[source.children[i].attributes.Name] = xmlParseContext(source.children[i]); break;
				case "Executable": 	element[source.children[i].attributes.Name] = xmlParseElfTag(source.children[i]); break;
				case "Script":	element[source.children[i].attributes.Name] = xmlParseCodeTag(source.children[i]); break;
				case "Dialog":	element[source.children[i].attributes.Name] = xmlParseDialogTag(source.children[i]); break;
			}
		}
	}
}
function xmlParseSubMenu(element) {
    const submenu = {};
    submenu.Items = [];
    xmlDefineDefaultProperty(submenu, element);

	for (let i = 0; i < element.children.length; i++) {
		const option = element.children[i];
		if ((option.tagName !== "Option") || (('Hide' in option.attributes) && (option.attributes.Hide === "true"))) { continue; }

		if ("filepath" in option.attributes) {
			const optionObj = option.attributes.filepath;
			submenu.Items.push(optionObj);
			return;
		}

		const optionObj = {
			Name: xmlGetLocalizedString(option, "Name"),
			Description: xmlGetLocalizedString(option, "Description"),
			Type: option.attributes.Type,
			Icon: xmlParseIcon(option.attributes.Icon)
        };

		xmlDefineEvalProperty(optionObj, "Name");
        xmlDefineEvalProperty(optionObj, "Description");

		if (option.attributes.Type === "SUBMENU") { optionObj.Value = xmlParseSubMenu(option); }
		else if (option.attributes.Type === "CONTEXT") { optionObj.Value = xmlParseContext(option); }
		else if (option.attributes.Type === "CODE") { optionObj.Value = xmlParseCodeTag(option); }
		else if (option.attributes.Type === "ELF") { optionObj.Value = xmlParseElfTag(option); }
		else if (option.attributes.Type === "DIALOG") { optionObj.Value = xmlParseDialogTag(option); }
        submenu.Items.push(optionObj);
	}

    return submenu;
}
function parseXmlPlugin(parsedData) {
    try {

        if ((!('tagName' in parsedData)) || (parsedData.tagName !== "App")) { return {}; }

        const plugin = {
            Name: xmlGetLocalizedString(parsedData, "Name"),
            Description: xmlGetLocalizedString(parsedData, "Description"),
            Icon: xmlParseIcon(parsedData.attributes.Icon),
            Category: parseInt(parsedData.attributes.Category),
            Type: parsedData.attributes.Type
        };

        xmlDefineEvalProperty(plugin, "Name");
        xmlDefineEvalProperty(plugin, "Description");

        // Check for CustomIcon and add it if present
        const customIconTag = parsedData.children.find(child => child.tagName === "CustomIcon");
        if (customIconTag) { plugin.CustomIcon = customIconTag.attributes.Path; }

        switch (plugin.Type) {
            case "SUBMENU":
                const optionsTag = parsedData.children.find(child => child.tagName === "Options");
                if (optionsTag) {
                    if ('filepath' in optionsTag.attributes) {
                        const fpath = `${PATHS.Plugins}${optionsTag.attributes.filepath}`;
                        if (std.exists(fpath)) {
                            plugin.Value = {};
                            plugin.Value.Items = std.loadScript(fpath);
                            xmlDefineDefaultProperty(plugin.Value, parsedData);
                            if (('HideEmpty' in optionsTag.attributes) && (optionsTag.attributes.HideEmpty === "true") && (plugin.Value.Items.length < 1)) { return false; }
                        }
                    }
                    else if ('Type' in optionsTag.attributes) {
                        switch (optionsTag.attributes.Type) {
                            case "Explorer":
                                plugin.Value = {};
                                plugin.Value.ExploreParams = {};
                                if ('ExtensionFilter' in optionsTag.attributes) {
                                    plugin.Value.ExploreParams.fileFilters = optionsTag.attributes.ExtensionFilter.replace(' ', '').split(',');
                                }
                                if ('DeviceFilter' in optionsTag.attributes) {
                                    const devices = optionsTag.attributes.DeviceFilter.split(',');
                                    function filterDevices(item) {
                                        for (let i = 0; i < devices.length; i++) {
                                            if (item.Name.includes(devices[i]) === true) { return false; }
                                        }
                                        return true;
                                    }
                                    plugin.Value.FilterDev = filterDevices;
                                }

                                Object.defineProperty(plugin.Value, "Items", {
                                    get() {
                                        let devices = getDevicesAsItems(this.ExploreParams);
                                        if (this.FilterDev) { devices = devices.filter(this.FilterDev); }
                                        delete this.Items;
                                        this.Items = devices;
                                        return devices;
                                    },
                                    enumerable: true,
                                    configurable: true
                                });

                                xmlDefineDefaultProperty(plugin.Value, parsedData);
                                break;
                        }
                    }
                    else if ('cdata' in optionsTag) {
                        plugin.Value = {};
                        plugin.Value.Items = std.evalScript(`(() => { ${optionsTag.cdata} })();`);
                        xmlDefineDefaultProperty(plugin.Value, parsedData);
                        if (('HideEmpty' in optionsTag.attributes) && (optionsTag.attributes.HideEmpty === "true") && (plugin.Value.Items.length < 1)) { return false; }
                    }
                }
                else { plugin.Value = xmlParseSubMenu(parsedData); }
                const initTag = parsedData.children.find(child => child.tagName === "Init");
                if (plugin.Value && initTag && "cdata" in initTag) {
                    plugin.Value.Init = std.evalScript(`(${initTag.cdata})`);
                }
                console.log("parseXmlPlugin(): SUBMENU Parse Finished.")
                break;
            case "CONTEXT": plugin.Value = xmlParseContext(parsedData); break;
            case "ELF": plugin.Value = xmlParseElfTag(parsedData); break;
            case "CODE": plugin.Value = xmlParseCodeTag(parsedData); break;
            case "DIALOG": plugin.Value = xmlParseDialogTag(parsedData); break;
        }

        console.log("parseXmlPlugin(): Parsing TOP Named Childrens.")
        xmlParseNamedChildrens(parsedData, plugin);
        console.log("parseXmlPlugin(): Plugin Parse Finished.")
        return plugin;
    } catch (e) {
        xlog(`parseXmlPlugin(): Error parsing XML: ${e.message}`);
        return false;
    }
}

console.log("INIT LIB: XML COMPLETE");
