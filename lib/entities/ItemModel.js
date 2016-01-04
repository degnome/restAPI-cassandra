module.exports = {
    "fields": {
        "id" : {
          "type": "varchar",
          "default": null
        },
        "uniqueProperty": {
          "type": "varchar",
          "default": null
        },
        "property1": {
          "type": "varchar",
          "default": null
        },
        "property2": {
          "type": "varchar",
          "default": null
        },
        "property3": {
          "type": "int",
          "default":  null
        },
        "created" : {
          "type": "timestamp",
          "default" : { "$db_function": "dateOf(now())" }
        },
        "updated" : {
          "type": "timestamp",
          "default" : { "$db_function": "dateOf(now())" }
        }
    },
    "key" : ["id"],
    "indexes": ["uniqueProperty"]
}