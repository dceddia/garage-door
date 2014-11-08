#!/usr/bin/python3

import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BOARD)

led = 12
GPIO.setup(led, GPIO.OUT)
GPIO.output(led, 1)
time.sleep(8)
GPIO.output(led, 0)
GPIO.cleanup()

