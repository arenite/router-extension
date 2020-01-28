/*global Arenite:true*/
Arenite.LocationRouter = function (arenite) {
  var _base;
  var _routes = {};

  var _trigger = function (location, updateLocation) {
    location = location.replace(/\/{2,}/, '/')
    _routes.toKeyArray(_routes).forEach(function (route) {
      var args = _routes[route].regex.exec(location);
      if (args) {
        args.splice(0, 1);
        _executeRoute(route, args, _routes[route].vars, updateLocation ? location : updateLocation);
      }
    });
  };

  var _update = function (location) {
    window.history.pushState(undefined, undefined, location + window.location.search + window.location.hash)
  };

  var _executeRoute = function (route, args, vars, updateLocation) {
    _routes[route].executions.forEach(function (execution) {
      if (updateLocation && window.location.pathname !== updateLocation) {// updating the location will trigger the execution again
        _update(updateLocation);
      }
      var exec = JSON.parse(JSON.stringify(execution));
      if (typeof execution.func === 'function') {
        exec.func = execution.func;
        exec.args = [{ref: 'arenite'}];
      }
      if (!exec.args) {
        exec.args = [];
      }
      var values = {};
      args.forEach(function (arg, i) {
        values[vars[i]] = arg;
      });
      exec.args.push({value: values});
      window.console.log('Arenite.Router: Executing route "' + route + '" with:', exec);
      arenite.di.exec(exec);
    });
  };

  var _handleChange = function () {
    _trigger(window.location.pathname);
  };

  var _init = function (routes, base, passive) {
    _base = base || "/";
    if (!passive) {
      window.onpopstate = function (ev) {
        _trigger(window.location.pathname)
      }
    }
    routes.toKeyArray().forEach(function (route) {
      _add(route, routes[route]);
    });
    _handleChange();
  };

  var _add = function (route, executions) {
    var regex = '^' + route.replace(/:[^/]+/g, '([^/]+)') + "$";
    var vars = route.match(/:[^/]+/g);
    vars.forEach(function (v, i) {
      vars[i] = v.substring(1);
    });
    _routes[route] = {executions: executions, regex: new RegExp(regex), vars: vars};
  };

  var _remove = function (route) {
    delete _routes[route];
  };

  return {
    init: _init,
    add: _add,
    remove: _remove,
    trigger: _trigger,
    update: _update
  };
};