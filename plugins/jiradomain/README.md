# Jira Domain

## Summary

This plugin converts Jira data to [Domain Layer](../domainlayer/README.md) data


## How to trigger the conversion task
```
curl --location --request POST 'localhost:8080/pipelines' \
--header 'Content-Type: application/json' \
--data-raw '
{
    "name": "jiradomain 20211126",
    "tasks": [[{
        "plugin": "jiradomain"
    }]]
}
'
```
