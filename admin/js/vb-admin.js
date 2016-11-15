'use strict';

/**
 * This file controls the visualization editor. It works on top of vb.js inside
 * of the admin dashboard.
 */

// The _vbAdminGlobal is set by wp_localize_script() in the vb admin php file.
var _vbPluginUrl = _vbAdminGlobal.vbPluginUrl;

// Initialize all modules.
angular.module('vbAdmin.tabs', []);
angular.module('vbAdmin.chart', []);
angular.module('vbAdmin.datasetSelect', []);
angular.module('vbAdmin.shortcode', []);

/**
 * Kick it off.
 */
(function (vb, $, angular) {

    var _vbPluginUrl = _vbAdminGlobal.vbPluginUrl;

    var vbAdmin = angular.module('vbAdmin', ['vbAdmin.tabs', 'vbAdmin.chart', 'vbAdmin.datasetSelect', 'vbAdmin.shortcode']);

    vbAdmin.controller('vbController', function ($scope, $http, $rootScope, $timeout) {
        console.log('vbController running.');

        // We'll collect metadata of datasets here.
        var ids_url = _vbPluginUrl + 'vis/api.php?filter=id';

        // First load all dataset IDs.
        $http.get(ids_url).success(function (ids) {

            // Function to fetch metadata given a dataset ID.
            function fetchMetaFromId(id) {
                var next_meta_url = _vbPluginUrl + 'vis/api.php?filename=' + id + '_meta.json';
                var req = $http.get(next_meta_url).success(function (next_meta) {
                    $timeout(function () {
                        $rootScope.$broadcast('ajax.newDataset', next_meta);
                    });
                });
                return req;
            }
            // Then fetch metadata for all datasets.
            $.when.apply($, $.map(ids, fetchMetaFromId)).done(function () {
                // $scope.datasets = datasets;
                // console.log(datasets.length)
            });
        });
    });
})(visualbudget, jQuery, angular);
'use strict';

angular.module('PubSub', []).factory('PubSub', ['$timeout', function ($timeout) {
  /**
   * Alias a method while keeping the context correct,
   * to allow for overwriting of target method.
   *
   * @private
   * @this {PubSub}
   * @param {String} fn The name of the target method.
   * @return {function} The aliased method.
   */
  function alias(fn) {
    return function closure() {
      return this[fn].apply(this, arguments);
    };
  }

  var PubSub = {
    topics: {}, // Storage for topics that can be broadcast or listened to.
    subUid: -1 // A topic identifier.
  };

  /**
   * Subscribe to events of interest with a specific topic name and a
   * callback function, to be executed when the topic/event is observed.
   *
   * @this {PubSub}
   * @param {String} topic The topic name.
   * @param {function} callback Callback function to execute on event, taking two arguments:
   *        - {*} data The data passed when publishing an event
   *        - {Object} topic  The topic's info (name & token)
   * @param {Boolean} [once=false] Checks if event will be triggered only one time.
   * @return {Number} The topic's token.
   */
  PubSub.subscribe = function (topic, callback, once) {
    var token = this.subUid += 1,
        obj = {};

    if (typeof callback !== 'function') {
      throw new TypeError('When subscribing for an event, a callback function must be defined.');
    }

    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }

    obj.token = token;
    obj.callback = callback;
    obj.once = !!once;

    this.topics[topic].push(obj);

    return token;
  };

  /**
   * Subscribe to events of interest setting a flag
   * indicating the event will be published only one time.
   *
   * @this {PubSub}
   * @param {String} topic The topic's name.
   * @param {function} callback Callback function to execute on event, taking two arguments:
   *        - {*} data The data passed when publishing an event
   *        - {Object} topic The topic's info (name & token)
   * @return {Number} The topic's token.
   */
  PubSub.subscribeOnce = function (topic, callback) {
    return this.subscribe(topic, callback, true);
  };

  /**
   * Publish or broadcast events of interest with a specific
   * topic name and arguments such as the data to pass along.
   *
   * @this {PubSub}
   * @param {String} topic The topic's name.
   * @param {*} [data] The data to be passed.
   * @return {Boolean} True if topic exists and event is published; otherwise false.
   */
  PubSub.publish = function (topic, data) {
    var that = this,
        len,
        subscribers,
        currentSubscriber,
        token;

    if (!this.topics[topic]) {
      return false;
    }

    $timeout(function () {
      subscribers = that.topics[topic];
      len = subscribers ? subscribers.length : 0;

      while (len) {
        len -= 1;
        token = subscribers[len].token;
        currentSubscriber = subscribers[len];

        currentSubscriber.callback(data, {
          name: topic,
          token: token
        });

        // Unsubscribe from event based on tokenized reference,
        // if subscriber's property once is set to true.
        if (currentSubscriber.once === true) {
          that.unsubscribe(token);
        }
      }
    }, 0);

    return true;
  };

  /**
   * Unsubscribe from a specific topic, based on the topic name,
   * or based on a tokenized reference to the subscription.
   *
   * @this {PubSub}
   * @param {String|Object} topic Topic's name or subscription referenece.
   * @return {Boolean|String} False if `topic` does not match a subscribed event, else the topic's name.
   */
  PubSub.unsubscribe = function (topic) {
    var tf = false,
        prop,
        len;

    for (prop in this.topics) {
      if (Object.hasOwnProperty.call(this.topics, prop)) {
        if (this.topics[prop]) {
          len = this.topics[prop].length;

          while (len) {
            len -= 1;

            // If t is a tokenized reference to the subscription.
            // Removes one subscription from the array.
            if (this.topics[prop][len].token === topic) {
              this.topics[prop].splice(len, 1);
              return topic;
            }

            // If t is the event type.
            // Removes all the subscriptions that match the event type.
            if (prop === topic) {
              this.topics[prop].splice(len, 1);
              tf = true;
            }
          }

          if (tf === true) {
            return topic;
          }
        }
      }
    }

    return false;
  };

  // Alias for public methods.
  PubSub.on = alias('subscribe');
  PubSub.once = alias('subscribeOnce');
  PubSub.trigger = alias('publish');
  PubSub.off = alias('unsubscribe');

  return PubSub;
}]);
'use strict';

/*
 * The "chart" directive of the VB dashboard.
 */

var chartController = function chartController($scope, $http, $sce) {
    $scope.ctrl = this;
    var that = this;

    var chartUrl = _vbPluginUrl + 'vis/vis.php?';

    this.getUrl = function () {
        $scope.$parent.$parent.atts.vis = $scope.vis;
        var atts = angular.copy($scope.$parent.$parent.atts);
        if ($scope.metric) {
            atts.metric = $scope.metric;
        }

        return chartUrl + that.serialize(atts);
        // return '[' + chartUrl + that.serialize(atts) + ']';
    };

    this.setHtml = function (html) {
        $scope.html = $sce.trustAsHtml(html);
    };

    // Turn a JS object into a query string of some form.
    // based on code from  http://stackoverflow.com/a/1714899
    this.serialize = function (obj) {
        var sep = '&';
        var str = [];
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        }return str.join(sep);
    };
};

var chartLinkFunction = function chartLinkFunction(scope, element, attrs, paneController) {
    paneController.addChart(scope);
};

angular.module('vbAdmin.chart').directive('chart', function () {
    return {
        require: '^pane',
        restrict: 'E',
        transclude: false,
        scope: { vis: '@', metric: '@' },
        link: chartLinkFunction,
        controller: chartController,
        templateUrl: _vbPluginUrl + 'admin/js/src/chart.html',
        replace: true
    };
});
'use strict';

/*
 * The "dataset-select" directive of the VB dashboard.
 */

var datasetSelectController = function datasetSelectController($scope, $http) {
    $scope.ctrl = this;

    // $scope.$parent.chartData = {};
    // $scope.$parent.chartData.dataset = $scope.$parent.datasets[0];

    $scope.setDataset = function () {
        $scope.$parent.atts.data = $scope.$parent.chartData.dataset.id;
        $scope.$parent.ctrl.redrawCharts();
    };

    $scope.setDataset();
};

var datasetSelectLinkFunction = function datasetSelectLinkFunction(scope, element, attrs, paneController) {
    paneController.addDatasetSelect(scope);
};

angular.module('vbAdmin.datasetSelect').directive('datasetSelect', function () {
    return {
        require: '^pane',
        restrict: 'E',
        transclude: false,
        scope: false,
        link: datasetSelectLinkFunction,
        controller: datasetSelectController,
        templateUrl: _vbPluginUrl + 'admin/js/src/datasetSelect.html',
        replace: true
    };
});
'use strict';

/*
 * The "pane" directive of the VB dashboard.
 */

var paneController = function paneController($scope, $http, $timeout) {
    $scope.ctrl = this;
    var that = this;

    // These are the chart attributes.
    var atts = $scope.atts = {};

    // While loading, we provide filler data.
    var loading = true;
    $scope.chartData = {};
    $scope.datasets = [{
        id: 'loading...',
        uploaded_name: '[loading...]'
    }];
    $scope.chartData.dataset = $scope.datasets[0];

    // This happens when a new dataset is broadcast down
    // from vbAdmin.
    var addDataset = function addDataset(event, metadata) {
        if (loading) {
            loading = false;
            $scope.datasets = [metadata];
            $scope.chartData.dataset = $scope.datasets[0];
            $scope.atts.data = metadata.id;

            if ($scope.selected) {
                $timeout(that.redrawCharts, 0);
            }
        } else {
            $scope.datasets.push(metadata);
        }
    };
    // Bind the event.
    $scope.$on('ajax.newDataset', addDataset);

    var charts = $scope.charts = [];
    this.addChart = function (chart) {
        charts.push(chart);
    };

    var datasetSelect = $scope.datasetSelect = null;
    this.addDatasetSelect = function (select) {
        datasetSelect = select;
    };

    this.redrawCharts = function () {
        // Don't redraw charts if no datasets have been loaded.
        if (loading) {
            return;
        }

        var _loop = function _loop(k) {
            $http.get($scope.charts[k].ctrl.getUrl()).success(function (response) {
                $scope.charts[k].ctrl.setHtml(response);
                $timeout(visualbudget.initialize, 0);
            });
        };

        for (var k = 0; k < $scope.charts.length; k++) {
            _loop(k);
        }
    };
};

var paneLinkFunction = function paneLinkFunction(scope, element, attrs, tabsController) {
    tabsController.addPane(scope);
};

angular.module('vbAdmin.tabs').directive('pane', function () {
    return {
        require: '^tabs',
        restrict: 'E',
        transclude: true,
        scope: { title: '@' },
        link: paneLinkFunction,
        templateUrl: _vbPluginUrl + 'admin/js/src/pane.html',
        replace: true,
        controller: paneController
    };
});
'use strict';

/*
 * The "shortcode" directive of the VB dashboard.
 */

var shortcodeController = function shortcodeController($scope, $http) {
    $scope.ctrl = this;

    this.shortcode = function () {
        var atts = angular.copy($scope.$parent.$parent.atts);
        if ($scope.metric) {
            atts.metric = $scope.metric;
        }

        return '[visualbudget ' + this.serialize(atts) + ']';
    };

    // Turn a JS object into a query string of some form.
    // based on code from  http://stackoverflow.com/a/1714899
    this.serialize = function (obj) {
        var sep = ' ';
        var str = [];
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        }return str.join(sep);
    };
};

angular.module('vbAdmin.shortcode').directive('shortcode', function () {
    return {
        restrict: 'E',
        transclude: false,
        scope: { metric: '@' },
        controller: shortcodeController,
        templateUrl: _vbPluginUrl + 'admin/js/src/shortcode.html',
        replace: true
    };
});
'use strict';

/*
 * The "tabs" directive of the VB dashboard.
 */

var tabsController = function tabsController($scope, $http) {
    var panes = $scope.panes = [];

    $scope.select = function (pane) {
        angular.forEach(panes, function (pane) {
            pane.selected = false;
        });
        pane.selected = true;
        pane.ctrl.redrawCharts();
    };

    this.addPane = function (pane) {
        if (panes.length == 0) $scope.select(pane);
        panes.push(pane);
    };
};

angular.module('vbAdmin.tabs').directive('tabs', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: false,
        controller: tabsController,
        templateUrl: _vbPluginUrl + 'admin/js/src/tabs.html',
        replace: true
    };
});
