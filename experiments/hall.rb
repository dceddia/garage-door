#!/usr/bin/ruby

require 'pi_piper'
require 'syslog'

include PiPiper

def door_state(pin_value)
  pin_value == 0 ? "door is OPEN" : "door is CLOSED"
end

hall_pin = PiPiper::Pin.new(:pin => 18, :direction => :in, :invert => true, :pull => :down)

Syslog.open('garage-door', Syslog::LOG_PID, Syslog::LOG_USER)

s = door_state(hall_pin.value)
Syslog.info(s)
puts s

watch :pin => 18, :invert => true do
  s = door_state(value)
  Syslog.info(s)
  puts s
end

loop do
  PiPiper.wait
end
