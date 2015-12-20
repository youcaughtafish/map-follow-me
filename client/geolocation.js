module.exports = {
  getCurrentPosition: function getCurrentPosition(cb) {
    if (!_geolocationSupported(cb)) return;

    navigator.geolocation.getCurrentPosition(function(position) { 
      cb(position);
    }, function() {}, { enableHighAccuracy: true });
  }, 

  watchPosition: function watchPosition(cb) {
    if (!_geolocationSupported(cb)) return null;

    return navigator.geolocation.watchPosition(function(position) { 
      cb(position);
    }, function() {}, { enableHighAccuracy: true });
  },

  clearWatch: function clearWatch(id) {
    if (_geolocationSupported()) {
      navigator.geolocation.clearWatch(id);
    }
  }
};

function _geolocationSupported(cb) {
  if (!('geolocation' in navigator)) {

    if (typeof cb === 'function') cb({ error: 'geolocation not found in navigator'});

    return false;
  }

  return true;
}