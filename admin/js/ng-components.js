angular.module('components', [])

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
