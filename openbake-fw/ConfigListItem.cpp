// 
// 
// 

#include "ConfigListItem.h"

using namespace Theme;

ConfigListItem::ConfigListItem() {}

ConfigListItem::ConfigListItem(ConfigNode* _node, Adafruit_ILI9341* _tft, TouchScreen* _ts)
{
	node = _node;
	tft = _tft;
	ts = _ts;

	initialize();
}

ConfigListItem::~ConfigListItem()
{

}

void ConfigListItem::initialize()
{
	uint16_t t_w; uint16_t t_h; int16_t t_x; int16_t t_y;
	int16_t height = H / ITEMS_PER_PAGE;

	tft->getTextBounds("Back", 0, H, &t_x, &t_y, &t_w, &t_h);
	tft->setCursor(left_offset, (height / 2) + (t_h / 2));
	tft->println("Back");
	drawLeftArrow(tft, padding, height / 2);
	tft->drawFastHLine(0, height, W, border_color);

	for (int i = 0; i < node->num_children; i++)
	{
		int line_y = (i + 2) * height;
		tft->drawFastHLine(0, line_y, W, border_color);
		tft->getTextBounds(node->children[i]->name, 0, H, &t_x, &t_y, &t_w, &t_h);
		int text_x = left_offset;
		int text_y = line_y - (height / 2) + (t_h / 2);
		tft->setCursor(text_x, text_y);
		tft->println(node->children[i]->name);

		if (!node->exit_node)
		{
			drawRightArrow(tft, W - padding, line_y - (height / 2));
		}
	}
}

void ConfigListItem::update()
{

}

void ConfigListItem::drawLeftArrow(Adafruit_ILI9341* _tft, int x, int y)
{
	tft->drawLine(x, y, x + padding, y - padding, border_color);
	tft->drawLine(x, y, x + padding, y + padding, border_color);
}

void ConfigListItem::drawRightArrow(Adafruit_ILI9341* _tft, int x, int y)
{
	tft->drawLine(x, y, x - padding, y - padding, border_color);
	tft->drawLine(x, y, x - padding, y + padding, border_color);
}


