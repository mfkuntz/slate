---
title: API Reference

language_tabs:
  - shell

toc_footers:
  - <a href='#'>Sign Up for a Developer Key</a>
  - <a href='https://github.com/tripit/slate'>Documentation Powered by Slate</a>

includes:
  - errors

search: true
---

# Introduction

Welcome to the Kittn API! You can use our API to access Kittn API endpoints, which can get information on various cats, kittens, and breeds in our database.

We have language bindings in Shell, Ruby, and Python! You can view code examples in the dark area to the right, and you can switch the programming language of the examples with the tabs in the top right.

This example API documentation page was created with [Slate](https://github.com/tripit/slate). Feel free to edit it and use it as a base for your own API's documentation.

# Authentication

> To authorize, use this code:


```shell
# With shell, you can just pass the correct header with each request
# curl "api_endpoint_here"
  # -H "Authorization: meowmeowmeow"
```

> Make sure to replace `meowmeowmeow` with your API key.

Kittn uses API keys to allow access to the API. You can register a new Kittn API key at our [developer portal](http://example.com/developers).

Kittn expects for the API key to be included in all API requests to the server in a header that looks like the following:

`Authorization: meowmeowmeow`

<aside class="notice">
You must replace <code>meowmeowmeow</code> with your personal API key.
</aside>

# Portal Settings

## Is Elasticsearch Enabled

```shell
curl "https://manager-special.mfkuntz.com/api/portalsetting/IsElasticsearchEnabled/65780"
```
> Return Value:

```json
{
  "result": true
}
```

# Products

## Get All Products

```shell
curl "https://manager-special.mfkuntz.com/api/product"
```

> The above command returns JSON structured like this:

```json
[
  {
    "id":"de163de0-684b-41bc-8a13-ae82b395188f",
    "manufacturer":"Test",
    "productGroup":"Test group",
    "title":"Test Title",
    "upc":"01234567890",
    "human_id":1,
    "category":-1
  }
]
```

This endpoint retrieves all products.


<aside class="success">
Remember — a happy kitten is an authenticated kitten!
</aside>

## Get a Specific Kitten


```shell
# curl "http://example.com/api/kittens/2"
#  -H "Authorization: meowmeowmeow"
```


> The above command returns JSON structured like this:

```json
// {
//   "id": 2,
//   "name": "Max",
//   "breed": "unknown",
//   "fluffiness": 5,
//   "cuteness": 10
// }
```

This endpoint retrieves a specific kitten.

<aside class="warning">Inside HTML code blocks like this one, you can't use Markdown, so use <code>&lt;code&gt;</code> blocks to denote code.</aside>

### HTTP Request

`GET http://example.com/kittens/<ID>`

### URL Parameters

Parameter | Description
--------- | -----------
ID | The ID of the kitten to retrieve

