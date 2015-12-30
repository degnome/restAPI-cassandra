module.exports = {
    "fields": {
        "id" : { 
          "type": "varchar", 
          "default": null
        },
        "username": { 
          "type": "varchar", 
          "default": null 
        },
        "email": { 
          "type": "varchar", 
          "default": null 
        },
        "firstname": {
          "type": "varchar", 
          "default": null 
        },
        "lastname": {
          "type": "varchar",
          "default":  null 
        },
        "created" : {
          "type": "timestamp", 
          "default" : { "$db_function": "dateOf(now())" } 
        }
    },
    "key" : ["id"],
    "indexes": ["username"]
}