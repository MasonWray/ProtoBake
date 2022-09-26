// MainView.h

#ifndef _MAINVIEW_h
#define _MAINVIEW_h

#if defined(ARDUINO) && ARDUINO >= 100
#include "arduino.h"
#else
#include "WProgram.h"
#endif

#include "AppState.h"
#include "View.h"
#include "Theme.h"
#include "Button.h"
#include "ViewUtils.h"
#include "TempChart.h"
#include <Adafruit_ILI9341.h>
#include <TouchScreen.h>
#include <Adafruit_MAX31855.h>

#define TEMP_UPDATE 1000

class MainView : public View
{
public:
	MainView(int width, int height, Adafruit_ILI9341* _tft, TouchScreen* _ts, Adafruit_MAX31855* _tc, AppState* _state);
	~MainView();
	void update();
	void initialize();

private:
	int timer;
	TempChart temp_chart;
	float temp;
	Button start;
	Button config;

	ViewUtils::BoundingBox profile_box;
	ViewUtils::BoundingBox time_box;
	ViewUtils::BoundingBox temp_box;
};

#endif

