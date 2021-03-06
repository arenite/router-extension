/*global Arenite:true*/
Arenite.HashRouter = function (arenite) {

  var _routes = {};

  var _trigger = function (hash, updateHash) {
    if (hash.indexOf('#') !== 0) {
      hash = '#' + hash;
    }
    _routes.toKeyArray(_routes).forEach(function (route) {
      var args = _routes[route].regex.exec(hash);
      if (args) {
        args.splice(0, 1);
        _executeRoute(route, args, _routes[route].vars, updateHash ? hash : updateHash);
      }
    });
  };

  var _update = function (hash) {
    if (hash.indexOf('#') !== 0) {
      hash = '#' + hash;
    }
    window.history.pushState(undefined, undefined, hash)
  };

  var _executeRoute = function (route, args, vars, updateHash) {
    _routes[route].executions.forEach(function (execution) {
      if (updateHash && window.location.hash !== updateHash) {// updating the hash will trigger the execution again
        window.location.hash = updateHash;
        return;
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
    _trigger(window.location.hash);
  };

  var _init = function (routes, passive) {
    if (!passive) {
      document.body.onhashchange = _handleChange;
    }
    routes.toKeyArray().forEach(function (route) {
      _add(route, routes[route]);
    });
    _handleChange();
  };

  var _add = function (route, executions) {
    var regex = '^#' + route.replace(/:[^/]+/g, '([^/]+)') + "$";
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
