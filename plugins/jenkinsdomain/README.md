# Jenkins Domain

## Summary

This plugin converts Jenkins data to [Domain Layer](../domainlayer/README.md) data


## How to trigger the conversion task
```
curl --location --request POST 'localhost:8080/pipelines' \
--header 'Content-Type: application/json' \
--data-raw '
{
    "name": "jenkinsdomain 20211126",
    "tasks": [[{
        "plugin": "jenkinsdomain"
    }]]
}
'
```
