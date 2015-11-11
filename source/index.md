---
title: localResource API Reference

language_tabs:
  - JS

toc_footers:
  - <a href='http://github.com/tripit/slate'>Documentation Powered by Slate</a>


search: true
---

# localResource

Welcome to the localResource documentation! This library is used to cache angular resources in order to reduce API load.

It works by checking localForage instead of the API, and returning the cached data or transitioning to an API request to get the data. It also has an update system, to grab only changed records.



# Installation

## Dependencies

This library uses 

* [Mozilla localForage](https://github.com/mozilla/localForage) - store data off line
* [lodash](https://lodash.com/) - manipulate cached data 
* [Angular $q](https://docs.angularjs.org/api/ng/service/$q) - promise library
* [Moment.js](http://momentjs.com/) - cache lastUpdateDates

This implementation is written as two Angular services, but has no hard dependencies to Angular other than :

* the promise library, which can be replaced

* angular-resource, which is used to get the data from the server but could be implemented with a different data access method


# Angular Resource

The current implementation takes an angular resource object and extends it, adding our auto DA methods

## Extend

This method will take 1 angular resource, and extend it with our methods.

```js
//set the value of data.lead = data.name on resource.update
var customFieldMapping = [
    ['lead', 'name']
];

resourceExtender.extend(lead, 'leads', 'leadId', customFieldMapping);
```

Parameter | Type | Description
--------- | ---- | -----------
object | Angular Resource | This is the item we are extending
tableName | string / object | This is our cache's tableName 
itemKey | string / object | This is our resource's primary key name
customFieldMapping | `[[key, value]]` | This is used to handle any mismatches in item keys



### Table Name

`string`

This is simply the name of the table to use for the localForage store

```js
var tableName = 'ticketLog';

```

`object`

This is a key value pair of table names used to build a resource that has One to Many relations

```js
var tableName = {
  data: 'ticketLog', //store the actual data here
  link: 'ticket2Log' //build a link table that links 1 id to an array of item ids
};
```

### Item Key

`string`

This is the resource's Primary Key Name

```js
var itemKey = 'leadId';

```

`object`

This is a key value pair of item keys used to build a resource that has One to Many relations

```js
var itemKeys = {
  local: 'id', //used to save the data item
  parent: 'ticketId' //used to link multiple data items to 1 parent item
};
```

### Custom Field Mapping

`array[[key,value, delete]]`

This is used when a data item's fields may not match up with it's list item fields

If `delete` is true, it will delete the un-needed second key, `value` above and `name` in the example

```js
var customFieldMapping = [
    ['lead', 'name'] //on update, set object.lead = object.name
];

```



## autoGet

This method will get 1 specific item by it's Primary Key

Parameter | Type | Description
--------- | ---- | -----------
id | int / string | Primary key value of the item to get
buildFunction | function | callback when finished; returns 1 item on success

```js
leads.autoGet($state.leadId, function(lead){
  $state.lead = lead;
});
```

### Prerequisites

Uses `object.get()` from angular-resource. It needs to accept a `{pk:id}` parameter and should return 1 data item from the server


### How does it work?

1. Query the store to see if the item is already saved.

2. If a result is found, convert the saved JSON into a angular-resource and return it

3. If a record is not found or a result is not a data item, check the server

4. Cache the newly found object, and set the store's `lastUpdateDate` to now


## autoSave

This method will save the data to local storage and then the api

Parameter | Type | Description
--------- | ---- | -----------
item | angular-resource | item to save
success | function | api success callback
error | function | api error callback

```js
leads.autoSave($state.lead, function(lead){
  $state.lead = lead;
}, function(error){
  console.log(error);
});
```

### Prerequisites

Uses `object.$save()` from angular-resource. 


### How does it work?

1. Convert item to JSON and `_mapFields`

2. Update local store

3. Use resource `.$save()`




## autoList

This method will return a list of all items in the store

Parameter | Type | Description
--------- | ---- | -----------
params | object | the params object to use with angular resource's list call
buildFunction | function | callback when finished; returns 1 item on success

```js

var params = {
  size: options.data.take, //this and any other needed API params
  force: // do not hit localStorage, check the server. Used for any server side filters
}

leads.autoList(params, function(leads){
  $state.leads = leads;
});

```

### Prerequisites

Uses `object.list()` from angular-resource, and supports `object.listMine()` with a `{listMine:true}` param. 

`object.list()` should return a list of objects as `{data:list}` from the server


### How does it work?

1. Query the store to see if the items are already saved.

2. Next, check for 3 things
  * is it page load?
  * are we forcing the request? 
  * are any returned items missing the listItem data?

3. If so, we need to check the server for updates. If not, just build the object and return it

4. Save the resulting items, build and return the data source, and set the lastUpdateDate


## autoGetLinked

This method will return a list of all items using a 1 to many relation

Parameter | Type | Description
--------- | ---- | -----------
id | int / string | the Parent item id, used to find all child items
buildFunction | function | callback when finished; returns 1 item on success

```js

leads.autoList(lead.ticketId, function(ticketLogItems){
  $state.ticketLog = ticketLogItems;
});
```

### Prerequisites

Uses `object.get()` and `object.updates()` from angular-resource.

`object.get()` should return `{Data:list}` of all sub items returned by the parent item id. For example, passing in a ticketId should return all ticketLog items with that ticketId

`object.updates()` should return `{data:list}` and accept `{lastUpdateCheck:datetime}`, where list is ALL sub items for a parent item that has been updated. For example, if a new ticketLog is added to a ticket, `updates()` should return ALL ticketLog items for that ticket


### How does it work?

1. Query the store to see if the items are already saved.

2. Next, check 
  * is it page load?
  * are we forcing the request? 
  * are any returned items missing the listItem data?
  * was no data found?

3. If so, we need to check the server for updates. If not, just build the object and return it

4. Save the resulting items, build and return the data source, and set the lastUpdateDate


## getUpdates

This method will return a list of all items new / changed items. Its current implementation is used in a `window.setTimeout()` to poll for new leads

Parameter | Type | Description
--------- | ---- | -----------
params | object | any needed api parameters. Will auto add lastUpdateDate
buildFunction | function | callback when finished; returns 1 item on success

```js

var options = {};
options.assigned = true;
leads.getUpdates(options).then(function (result) {
    //result is only what changed
    if (result) {
      //query the autoList and grab all items, including the new changes
      leadDataSource.read({ view: 'assigned', customViewId: $scope.customViewId });
    }
});
```

### Prerequisites

Uses `object.updates()` from angular-resource.

`object.updates()` should return `{data:list}` and accept `{lastUpdateCheck:datetime}`, where list is all items that have been updated or created


### How does it work?

1. Query the store for the last time we updated. If never, use moment()

2. Check the server for all updates since then

3. Cache and return updates


## _ Helper Methods

### _getStore

This method will create and cache or return an existing localForage store, using the tableNames specified in the Extend section.

If the resource is 1 to Many, and `getLinkStore` is `true`, return the link store. Else, return the data store

Parameter | Type | Description
--------- | ---- | -----------
getLinkStore | bool | return the link store if it exists


### _getPK

This method will return the correct Primary Key name for this object

If the resource is 1 to Many, and `parentPK` is `true`, return the parent pk. Else, return the item key

Parameter | Type | Description
--------- | ---- | -----------
parentPK | bool | return the parent pk if it exists


### _mapFields

This method will fix any data format mismatches by replacing a field with another's value if a customFieldMapping is specified

Otherwise, return the same object passed in

Parameter | Type | Description
--------- | ---- | -----------
data | object | object to modify


### _buildDataSource

This method will create a data source object for use by Kendo from the passed in list. 

It will filter the list, and for every `object` create a new resource object using the resource object's constructor

It then returns `{
  data: list, 
  total: list.length // list length before any sort parameters 
}`

Parameter | Type | Description
--------- | ---- | -----------
list | list<data> | list to convert
params | object | sort, order and size parameters 


Valid `param` sub items

Parameter | Type | Description
--------- | ---- | -----------
sortOrder | string | field name - [lodash](https://lodash.com/docs#sortByOrder)
sortDir | string | `'asc'` or `'desc'` - [lodash](https://lodash.com/docs#sortByOrder)
size | int | number of records in the sub-set of data. dataSource total will be the number of ALL records - [lodash](https://lodash.com/docs#take)
skip | int | number of records to skip - [lodash](https://lodash.com/docs#slice)




## _ Helper Properties

These items are added to the resource to help only with internal functions

### _isListItem

Some display lists only have objects with a couple of fields to cut down in size. 

Check on listView if the data items exist and are actually listItems. 


### _isDataItem

Cache whether or not this is the full data object. The cached object may just be a _listItem with only an id and name field, so we need to grab the rest of the data items value.



`docs not finished, contains other items used in the _ helper methods`


#localStorage Service

This is a basic wrapper around localForage with some important helper methods


## createStore

Creates a localForage store with the supplied name.

In it's current form, this is the only method that interacts with `window.localForage`

```js
var store = localStorage.createStore(tableName);
```


Parameter | Type | Description
--------- | ---- | -----------
name | string | store name


## get

Wrapper for `.getItem`. Converts the id to a string as per the localForage docs

Returns the localForage promise

```js
localStorage.get(store, 12271).then(function(result){
  console.log(result);
});
```

Parameter | Type | Description
--------- | ---- | -----------
store | store | localForage store to query
id  | int / string | pk to lookup


## setData

Save a `{key:data}` pair. Will overwrite the existing record or create it. Wrapper for `.setItem`

Looks up the pk from the data sent, or uses the key as the actual pk if that fails

Will convert the data and all of it's children to JSON for storage

```js
//lookup the pk from data['leadId']
localStorage.setData(store, data, 'leadId').then(function(result){
  console.log(result);
});

//specify the pk
localStorage.setData(store, data, 12271).then(function(result){
  console.log(result);
});
```



Parameter | Type | Description
--------- | ---- | -----------
store | store | localForage store to query
data  | object | data to save
key | string / int | either the name of the pk, or the data value of the pk


## getArray

Return all items in the store. Wrapper for `.iterate`

```js
localStorage.getArray(store).then(function(result){
  console.log(result);
});
```


Parameter | Type | Description
--------- | ---- | -----------
store | store | localForage store to query


## setArray

Save all items in the array to the store

Uses our `.updateRecord` to handle saving

Returns an empty promise

```js
localStorage.setArray(store, rows, 'leadId').then(function(){
  console.log("Done");
});
```

Parameter | Type | Description
--------- | ---- | -----------
store | store | localForage store to query
rows  | list<data> | list of data to save
key | string | the name of the pk


## updateRecord

Update an existing record if it exists, or create it

Checks the store first, and if a result is found use `_.merge` from lodash to merge the 2 objects, preferring the new object for conflicts

Uses our `.setData` for saving after checking for merges

Returns an empty promise

```js
localStorage.updateRecord(store, item, 'leadId').then(function(){
  console.log("Done");
});
```


Parameter | Type | Description
--------- | ---- | -----------
store | store | localForage store to query
item  | object | item to update
key | string | the name of the pk

## setKVP 

Set a kvp to the store that does not follow the `{pk:data}` pattern used in the other setters.

Will always overwrite without trying to merge, wrapper for `.setItem`

```js
localStorage.setKVP(store, 'lastUpdateDate', moment().toJSON()).then(function(result){
  console.log(result);
});
```

Parameter | Type | Description
--------- | ---- | -----------
store | store | localForage store to query
key  | string | key name
value | object | thing to save, must be serializable as JSON

## delete

Delete an item from the store by it's id

**NOT IMPLEMENTED**

Parameter | Type | Description
--------- | ---- | -----------
store | store | localForage store to query
id  | int / string | item to delete


## getGlobal 

Return an item from the global localForage instance

Imagine the rest of the global gets/sets look like their counter parts without passing in a store object. 


Parameter | Type | Description
--------- | ---- | -----------
name | string | Item key to retrieve



## _forceJSON

Convert the parent object and all of it's children (1 layer down) to JSON by checking if they implement a `.toJSON` method and calling it



# End Remarks

Some extra footer space here: 


and Here


