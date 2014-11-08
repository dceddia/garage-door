#!/usr/bin/ruby

require 'pi_piper'

include PiPiper

pin = PiPiper::Pin.new(:pin => 18, :direction => :out)
pin.on
sleep 3
pin.off
