var mapboxgl = require('mapbox-gl');

/*
  @param {object} params
  @param {int}    params.accessToken
  @param {object} params.mapStyle
 */
var Map = module.exports = function(params, onLoadCallback) {
 mapboxgl.accessToken = params.accessToken;

 this._map = new mapboxgl.Map({
   container: 'map', // container id
   style: params.mapStyle,
   center: [0,0], // starting position
   zoom: 1 // starting zoom
 }).on('load', onLoadCallback.bind(this) || function(){});
};

/*
  @param {object} params
  @param {int}    params.id
  @param {object} params.lngLat
 */
Map.prototype.addToMap = function addToMap(params) {
  var itemId = params.id;

  var itemPoint = {
    "type": "Point",
    "coordinates": params.lngLat
  };

  var itemSource = new mapboxgl.GeoJSONSource({
    data: itemPoint
  });

  this._map.addSource(itemId, itemSource);

  this._map.addLayer({
    "id": itemId,
    "type": "symbol",
    "source": itemId,
    "layout": {
      "icon-image": "car-24",
    }
  });

  return {
    point: itemPoint,
    source: itemSource
  };
};

Map.prototype.flyTo = function(params) {
  this._map.flyTo(params);
};

Map.prototype.jumpTo = function(params) {
  this._map.jumpTo(params);
};

Map.prototype.removeFromMap = function removeFromMap(id) {
  this._map.removeLayer(id);
  this._map.removeSource(id);
};

/*
  @param {Object} params
  @param {Object} params.itemData
  @param {array}  params.lngLat
 */
Map.prototype.updateItemLocation = function updateItemLocation(params) {
  var itemData = params.itemData;
  itemData.point.coordinates = params.lngLat;
  itemData.source.setData(itemData.point);
};

