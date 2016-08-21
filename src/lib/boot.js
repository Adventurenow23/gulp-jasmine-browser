(function() {
  function injectQueryParams(env, QueryString, SpecFilter) {
    //TODO: test query params
    
    var queryString = new QueryString({
      getWindowLocation: function() { return window.location; }
    });

    var catchingExceptions = queryString.getParam('catch');
    env.catchExceptions(typeof catchingExceptions === 'undefined' ? true : catchingExceptions);

    var throwingExpectationFailures = queryString.getParam('throwFailures');
    env.throwOnExpectationFailure(throwingExpectationFailures);

    var random = queryString.getParam('random');
    env.randomizeTests(random);

    var seed = queryString.getParam('seed');
    if (seed) {
      env.seed(seed);
    }

    var specFilter = new SpecFilter({
      filterString: function() { return queryString.getParam('spec'); }
    });

    env.specFilter = function(spec) {
      return specFilter.matches(spec.getFullName());
    };
  }

  function extend(destination, source) {
    for (var property in source) destination[property] = source[property];
    return destination;
  }

  window.jasmine = window.jasmine || jasmineRequire.core(jasmineRequire);

  var env = jasmine.getEnv();
  injectQueryParams(env, jasmineRequire.QueryString(), jasmineRequire.HtmlSpecFilter());

  var jasmineInterface = jasmineRequire.interface(jasmine, env);

  extend(window, jasmineInterface);

  var jsonStreamReporter;

  if (jasmineRequire.profile) {
    jasmineRequire.profile(jasmineRequire, jasmine);
    var profileReporter = new jasmine.ProfileReporter({
      print: function(message) { jsonStreamReporter && jsonStreamReporter.message(message) }
    });
    env.addReporter(profileReporter);
  }

  if (window.JasmineJsonStreamReporter) {
    jsonStreamReporter = new JasmineJsonStreamReporter({
      print: function(message) {
        callPhantom({message: message});
      },
      onComplete: function() {
        callPhantom({exit: true});
      }
    });
    env.addReporter(jsonStreamReporter);
  }

  var currentWindowOnload = window.onload;
  window.onload = function() {
    if (currentWindowOnload) {
      currentWindowOnload();
    }
    env.execute();
  };
})();