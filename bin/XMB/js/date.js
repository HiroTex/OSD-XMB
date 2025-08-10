//////////////////////////////////////////////////////////////////////////
///*				   			  DATE								  *///
/// 				   		  										   ///
///		         This handles the time and date system.		           ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

class DateExtractor {
    constructor(startYear = 1970, endYear = 2099) {
        this.startYear = startYear;
        this.endYear = endYear;
        this.msPerDay = 86400000;
        this.yearTable = [];     // días acumulados por año desde startYear
        this.monthTables = {};   // días acumulados por mes en cada año

        this._buildTables();
    }

    // Año bisiesto (máscara rápida)
    _isLeapYear(year) {
        return (year & 3) === 0 && (year % 100 !== 0 || year % 400 === 0);
    }

    _buildTables() {
        let totalDays = 0;

        for (let y = this.startYear; y <= this.endYear; y++) {
            this.yearTable.push({ year: y, startDay: totalDays });

            const isLeap = this._isLeapYear(y);
            const dim = isLeap
                ? [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
                : [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            const acc = [];
            let days = 0;
            for (let i = 0; i < 12; i++) {
                acc.push(days);
                days += dim[i];
            }
            this.monthTables[y] = acc;
            totalDays += isLeap ? 366 : 365;
        }
    }

    extract(timezoneOffset) {
        const timestamp = Date.now() - 43200000; // Ajuste de 12 horas para Athena
        const totalDays = ~~(timestamp / this.msPerDay);
        const msOfDay = timestamp % this.msPerDay;

        // Hora, minuto, segundo, milisegundo
        let hour = ~~(msOfDay / 3600000);
        let minute = ~~(msOfDay / 60000) % 60;
        let second = ~~(msOfDay / 1000) % 60;
        let millisecond = msOfDay % 1000;

        // Buscar año usando tabla
        let year = this.startYear;
        for (let i = 0; i < this.yearTable.length; i++) {
            if (totalDays < this.yearTable[i].startDay) break;
            year = this.yearTable[i].year;
        }

        // Día del año
        const startOfYear = this.yearTable[year - this.startYear].startDay;
        let dayOfYear = totalDays - startOfYear;

        // Buscar mes usando tabla del año
        const monthTable = this.monthTables[year];
        let month = 0;
        while (month < 11 && dayOfYear >= monthTable[month + 1]) {
            month++;
        }

        let day = dayOfYear - monthTable[month] + 1;

        if (timezoneOffset !== 0) {
            minute += timezoneOffset;
            if (minute >= 60) {
                hour += ~~(minute / 60);
                minute %= 60;
            } else if (minute < 0) {
                hour += ~~(minute / 60) - 1;
                minute = (minute % 60 + 60) % 60;
            }
            if (hour >= 24) {
                day += ~~(hour / 24);
                hour %= 24;
            } else if (hour < 0) {
                day += ~~(hour / 24) - 1;
                hour = (hour % 24 + 24) % 24;
            }
            if (day > 31) {
                // Ajustar el día del mes
                const daysInMonth = monthTable[month + 1] - monthTable[month];
                if (day > daysInMonth) {
                    day -= daysInMonth;
                    month++;
                    if (month > 11) {
                        month = 0;
                        year++;
                        if (year > this.endYear) {
                            year = this.startYear; // Reiniciar al inicio
                        }
                    }
                }
            } else if (day < 1) {
                // Ajustar el día del mes hacia atrás
                month--;
                if (month < 0) {
                    month = 11;
                    year--;
                    if (year < this.startYear) {
                        year = this.endYear; // Reiniciar al final
                    }
                }
                const daysInPrevMonth = monthTable[month + 1] - monthTable[month];
                day += daysInPrevMonth;
            }
        }

        return {
            year,
            month: month + 1, // 1-based
            day,
            hour,
            minute,
            second,
            millisecond
        };
    }
}
function getLocalTime() {
    let mOffset = 0; // Adjust for Athena bug

    // Apply Timezone if necessary.
    let gmtOffset = GetOsdConfig("Timezone");
    if ((gmtOffset & 0x400) !== 0) {
        gmtOffset ^= 0x7ff; // Flip bits
        gmtOffset += 1; 	// Add one
        gmtOffset *= -1; 	// Make it negative
        gmtOffset /= 60;	// Get Hours
    }

    if (gTimezone !== 0) { mOffset = gTimezone * 60; }
    else if (gmtOffset !== 0) { mOffset = gmtOffset * 60; }

    // Athena has a bug where the current time is shifted 12 hours ahead.
    gTime = gDateExtractor.extract(mOffset);
}

const gDateExtractor = new DateExtractor();
let gTimezone = parseInt(GetCfgUserSetting("gTimezone"));
if (isNaN(gTimezone)) { gTimezone = 0; }
let gTime = {};
getLocalTime();

console.log("INIT LIB: DATE COMPLETE");
