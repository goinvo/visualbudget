angular.module('components', [])

  .directive('tabs', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      controller: function($scope, $http) {
        var panes = $scope.panes = [];

        $scope.select = function(pane) {
          angular.forEach(panes, function(pane) {
            pane.selected = false;
          });
          pane.selected = true;
        }

        this.addPane = function(pane) {
          if (panes.length == 0) $scope.select(pane);
          panes.push(pane);
        }





        // The _vbAdminGlobal is set by wp_localize_script() in the vb admin php file.
        // var ids_url = _vbAdminGlobal.vbPluginUrl + 'vis/api.php?filter=id';
        var ids_url = 'http://localhost:8888/wordpress/wp-content/plugins/visualbudget/vis/api.php?filter=id';

        // We'll collect metadata of datasets here.
        var datasets = $scope.datasets = [];

        // First load all dataset IDs.
        $http.get(ids_url).success( function(ids) {

            // Function to fetch metadata given a dataset ID.
            function fetchMetaFromId(id) {
                var next_meta_url = _vbAdminGlobal.vbPluginUrl + 'vis/api.php?filename=' + id + '_meta.json';
                $http.get(next_meta_url).success( function(next_meta) {
                    datasets.push(next_meta);
                });
            }

            ids.forEach(fetchMetaFromId);
        });






      },
      template:
        '<div class="tabbable tabs-left">' +
          '<ul class="nav nav-tabs">' +
            '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">'+
              '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
            '</li>' +
          '</ul>' +
          '<div class="tab-content" ng-transclude></div>' +
        '</div>',
      replace: true
    };
  })

  .directive('pane', function() {
    return {
      require: '^tabs',
      restrict: 'E',
      transclude: true,
      scope: { title: '@' },
      link: function(scope, element, attrs, tabsController) {
        tabsController.addPane(scope);
      },
      template:
        '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
        '</div>',
      replace: true,
      controller: function($scope) {
        $scope.ctrl = this;

        var chart = this.chart = null;
        // var dateSlider = this.dateSlider = null;
        // var shortcode = this.shortcode = null;
        // var iframeLink = this.iframeLink = null;
      }
    };
  })

  .directive('chart', function() {
    return {
      require: '^pane',
      restrict: 'E',
      scope: {},
      link: function(scope, element, attrs, paneCtrl) {
        paneCtrl.chart = scope;
      },
      template: '<div class="vb-chart-wrapper">{{ ctrl.getHtml() }}</div>',
      replace: true,
      controller: function($scope) {
        $scope.ctrl = this;
        this.loading = true;

        this.redraw = function() {
          console.log('chart.redraw()');
        }

        this.getHtml = function() {
          console.log('chart.getHtml()');
          // console.log($parent.$parent.datasets);
          if (this.loading) {
            return "Loading...";
          } else {
            return "Chart HTML.";
          }
        }
      }
    }
  })

  // .directive('shortcode', function() {
  //   return {
  //     require: '^pane',
  //     restrict: 'E',
  //     scope: {},
  //     link: function(scope, element, attrs, paneCtrl) {
  //       scope.paneCtrl = paneCtrl;
  //     },
  //     template: '<pre>{{ getShortcode }}</pre>',
  //     replace: true,
  //     controller: function($scope) {}
  //      $scope.ctrl = this;
  //   }
  // })

  // .directive('iframelink', function() {
  //   return {
  //     require: '^pane',
  //     restrict: 'E',
  //     scope: {},
  //     link: function(scope, element, attrs, paneCtrl) {},
  //     template: '',
  //     replace: true,
  //     controller: function($scope) {}
  //      $scope.ctrl = this;
  //   }
  // })
