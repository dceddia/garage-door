'use strict';

describe("GarageCtrl", function() {
	beforeEach(module("GarageMonitor"));

	var GarageCtrl, scope, GarageDoorMock;

	beforeEach(inject(function($controller, $rootScope, $q) {
		scope = $rootScope.$new();
		GarageDoorMock = {
			open: jasmine.createSpy('open'),
			close: jasmine.createSpy('close'),
			trigger: jasmine.createSpy('trigger'),
			checkLogin: jasmine.createSpy('checkLogin'),
			onStatusChange: jasmine.createSpy('onStatusChange'),
			getStatus: function() {
				var deferred = $q.defer();
				deferred.resolve(true);
				return deferred.promise;
			}
		}
		GarageCtrl = $controller("GarageCtrl", {$scope: scope, GarageDoor: GarageDoorMock});
	}));

	it("should initialize doorState", function() {
		expect(scope.doorState).toEqual("unknown");
	});
	
	describe("withState", function() {
		it("should choose the 'open' option if state is open", function() {
			expect(scope.withState('open', 'expected', 'unexpected1', 'unexpected2')).toEqual('expected');
		});

		it("should choose the 'closed' option if state is open", function() {
			expect(scope.withState('closed', 'unexpected1', 'expected', 'unexpected2')).toEqual('expected');
		});

		it("should choose the 'other' option if state is anything else", function() {
			expect(scope.withState('unknown', 'unexpected1', 'unexpected2', 'expected')).toEqual('expected');
			expect(scope.withState('opening', 'unexpected1', 'unexpected2', 'expected')).toEqual('expected');
			expect(scope.withState('closing', 'unexpected1', 'unexpected2', 'expected')).toEqual('expected');
			expect(scope.withState('stopped', 'unexpected1', 'unexpected2', 'expected')).toEqual('expected');
		});

		it("should call the given function if it's a function", function() {
			var fun = jasmine.createSpy('dummy');
			var other1 = jasmine.createSpy('other1');
			var other2 = jasmine.createSpy('other2');
			scope.withState('open', fun, other1, other2);
			expect(fun).toHaveBeenCalled();
			expect(other1).not.toHaveBeenCalled();
			expect(other2).not.toHaveBeenCalled();
		});
	});

	describe("statusIcon", function() {
		it("should be set for 'open'", function() {
			scope.doorState = 'open'
			expect(scope.statusIcon()).toEqual('fa-warning');
		});
	});
});