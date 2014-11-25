var proxyquire = require('proxyquire'),
    expect 		 = require('expect.js'),
    sinon			 = require('sinon');

var alerting;
var clock;

beforeEach(function() {
	mockConfig = {};
	mockTwilio = {};
	clock = sinon.useFakeTimers();

	alerting = proxyquire('../lib/alerting', {
		'twilio': mockTwilio,
		'../config': mockConfig
	});
});

afterEach(function() {
	clock.restore();
})

describe("sendAlert", function() {
	it("should do nothing if text messaging is disabled", function() {
		var twilioCalled = false;
		mockConfig.send_text_messages = false;
		mockTwilio.RestClient = function() {
			twilioCalled = true;
		};
		alerting.sendAlert('oh no!');
		expect(twilioCalled).to.be(false);
	});

	it("should send a message to every contact", function() {
		var called = false;
		mockConfig.send_text_messages = true;
		mockConfig.twilio_number = '+12223334444';
		mockConfig.contacts = ['+15552223333'];
		mockTwilio.RestClient = function() {
			return {
				sms: {
					messages: {
						create: function(msg, callback) {
							expect(msg.from).to.eql('+12223334444');
							expect(msg.to).to.eql('+15552223333');
							expect(msg.body).to.eql('an alert');
							called = true;
						}
					}
				}
			};
		};
		alerting.sendAlert('an alert');
		expect(called).to.be(true);
	});
});

describe("valueChanged", function() {
	beforeEach(function() {
		alerting.sendAlert = sinon.spy();
	})
	it("should alert after 5 minutes in 'opening' state", function() {
		alerting.valueChanged('closed', 'opening');
		clock.tick(4 * 60000); // advance 4 minutes
		expect(alerting.sendAlert.called).to.be(false);
		clock.tick(1 * 60000); // advance 1 more minute
		expect(alerting.sendAlert.called).to.be(true);
	});

	it("should alert after 5 minutes in 'closing' state", function() {
		alerting.valueChanged('open', 'closing');
		clock.tick(5 * 60000); // advance 5 minutes
		expect(alerting.sendAlert.called).to.be(true);
	});

	it("should alert after 5 minutes in 'open' state", function() {
		alerting.valueChanged('opening', 'open');
		clock.tick(5 * 60000); // advance 5 minutes
		expect(alerting.sendAlert.called).to.be(true);
	});

	it("should alert after 5 minutes in 'stopped' state", function() {
		alerting.valueChanged('opening', 'stopped');
		clock.tick(5 * 60000); // advance 5 minutes
		expect(alerting.sendAlert.called).to.be(true);
	});

	it("should reset the timer when 'closed'", function() {
		alerting.valueChanged('opening', 'open');
		alerting.valueChanged('open', 'closing');
		alerting.valueChanged('closing', 'closed');
		clock.tick(5 * 60000); // advance 5 minutes
		expect(alerting.sendAlert.called).to.be(false);
	});

	it("should alert every 5 minutes until closed", function() {
		alerting.valueChanged('open', 'closing');
		clock.tick(15 * 60000); // advance 15 minutes
		expect(alerting.sendAlert.calledThrice).to.be(true);
		alerting.valueChanged('closing', 'closed');
		clock.tick(15 * 60000); // advance 15 minutes
		expect(alerting.sendAlert.calledThrice).to.be(true);
	});
});