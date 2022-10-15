const { getNotionFunction } = require("./scripts/script")

const dueStateOriginal = `if(prop("done"), "✅ ", if(prop("State") == "Waiting...", "Waiting... ", concat(if(empty(prop("Due to")), "Set time block", if(or(dateBetween(end(prop("Due to")), now(), "hours") < -20, day(now()) > day(prop("Due to"))), "🚨 Late | ", if(or(abs(dateBetween(now(), prop("Due to"), "hours")) < 3, and(dateBetween(start(prop("Due to")), now(), "minutes") < 0, dateBetween(end(prop("Due to")), now(), "minutes") > 0)), "🔥 | ", ""))), if(and(month(now()) == month(prop("Due to")), date(now()) == date(prop("Due to"))), "Today", if(and(month(now()) == month(prop("Due to")), date(now()) < date(prop("Due to"))), "🟡 to come", "")))))`

let dueStateFunction = 
if(prop("State") == "Done",concat("✅ ", formatDate(prop("Last viewed"), "DD/MM")),
    concat(prop("Due state"), 
        if(empty(prop("Due to")), "",
            concat("🎯 Do ",
                if(and(dateBetween(prop("Due to"), now(), "hours") < 0, dateBetween(prop("Due to"), now(), "days") < 0),
                    " was ",
                    if(and(dateBetween(prop("Due to"), now(), "hours") < 8, dateBetween(prop("Due to"), now(), "hours") >= 0), 
                        "today", 
                        if(dateBetween(prop("Due to"), now(), "hours") < 24, 
                            concat("in ", format(dateBetween(end(prop("Due to")), now(), "hours")), "h "), 
                            concat("in ",format(dateBetween(end(prop("Due to")), now(), "days")), " days ")
                        )
                    )
                )
                " | "
            ), 
            if(empty(prop("Last viewed")), 
                "🚨 Not started ", 
                if(dateBetween(prop("Last viewed"), now(), "days") == 0, 
                    "👁️‍🗨️ Today ", 
                    concat("👁️‍🗨️ ", format(-dateBetween(prop("Last viewed"), now(), "days")), if(-dateBetween(prop("Last viewed"), now(), "days") > 1," days ago"," day ago"))
                )
            )
        )
    )
)

getNotionFunction(dueStateFunction)


if(prop("State") == "Done",concat("✅ ", formatDate(prop("Last viewed"), "DD/MM")),concat(prop("Due state"),if(empty(prop("Due to")), "",concat("🎯 Do ",if(and(dateBetween(prop("Due to"), now(), "hours") < 0, dateBetween(prop("Due to"), now(), "days") < 0)," was ",if(and(dateBetween(prop("Due to"), now(), "hours") < 8, dateBetween(prop("Due to"), now(), "hours") >= 0),"today",if(dateBetween(prop("Due to")), now(), "hours") < 24,concat("in ", format(dateBetween(end(prop("Due to")), now(), "hours")), "h "),concat("in ",format(dateBetween(end(prop("Due to")), now(), "days")), " days ")))))," | ",if(empty(prop("Last viewed")),"🚨 Not started ",if(dateBetween(prop("Last viewed"), now(), "days") == 0,"👁️‍🗨️ Today ",concat("👁️‍🗨️ ", format(-dateBetween(prop("Last viewed"), now(), "days")), if(-dateBetween(prop("Last viewed"), now(), "days") > 1," days ago"," day ago"))))))
