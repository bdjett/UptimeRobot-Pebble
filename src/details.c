#include <pebble.h>
#include "pebble-assist.h"
#include "common.h"
#include "details.h"

static Window *details_window;
static TextLayer *name_text_layer;
static BitmapLayer *status_icon_layer;
static GBitmap *status_icon_large;
static TextLayer *uptime_text_layer;
static TextLayer *url_text_layer;

void getDetails(char *monitorId) {
	APP_LOG(APP_LOG_LEVEL_DEBUG, "Getting info for %s", monitorId);
	Tuplet get_details_tuple = TupletInteger(MONITOR_GET_DETAILS, 1);
	Tuplet monitor_id_tuple = TupletCString(MONITOR_ID, monitorId);
	DictionaryIterator *iter;
	app_message_outbox_begin(&iter);

	if (iter == NULL) {
		return;
	}

	dict_write_tuplet(iter, &get_details_tuple);
	dict_write_tuplet(iter, &monitor_id_tuple);
	dict_write_end(iter);
	app_message_outbox_send();
}

void details_init(void) {
	details_window = window_create();

	Layer *window_layer = window_get_root_layer(details_window);
	GRect bounds = layer_get_frame(window_layer);

	status_icon_layer = bitmap_layer_create(GRect(0, 0, bounds.size.w, bounds.size.h));
	status_icon_large = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_PAUSE_ICON_LARGE);
	layer_add_child(window_layer, bitmap_layer_get_layer(status_icon_layer));

	name_text_layer = text_layer_create(GRect(0, 0, bounds.size.w, 30));
	text_layer_set_text_alignment(name_text_layer, GTextAlignmentCenter);
	text_layer_set_overflow_mode(name_text_layer, GTextOverflowModeTrailingEllipsis);
	text_layer_set_font(name_text_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
	text_layer_set_text(name_text_layer, "Loading...");
	layer_add_child(window_layer, text_layer_get_layer(name_text_layer));

	url_text_layer = text_layer_create(GRect(0, 30, bounds.size.w, 30));
	text_layer_set_text_alignment(url_text_layer, GTextAlignmentCenter);
	text_layer_set_overflow_mode(url_text_layer, GTextOverflowModeTrailingEllipsis);
	text_layer_set_font(url_text_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24));
	layer_add_child(window_layer, text_layer_get_layer(url_text_layer));

	uptime_text_layer = text_layer_create(GRect(0,120, bounds.size.w, 35));
	text_layer_set_text_alignment(uptime_text_layer, GTextAlignmentCenter);
	text_layer_set_overflow_mode(uptime_text_layer, GTextOverflowModeTrailingEllipsis);
	text_layer_set_font(uptime_text_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
	layer_add_child(window_layer, text_layer_get_layer(uptime_text_layer));
}

void details_show() {
	window_stack_push(details_window, true);
}

void details_destroy(void) {
	text_layer_destroy_safe(name_text_layer);
	gbitmap_destroy(status_icon_large);
	bitmap_layer_destroy(status_icon_layer);
	window_destroy_safe(details_window);
}

bool details_is_on_top() {
	return details_window == window_stack_get_top_window();
}

void details_in_received_handler(DictionaryIterator *iter) {
	Tuple *name_tuple = dict_find(iter, MONITOR_NAME);
	Tuple *status_tuple = dict_find(iter, MONITOR_STATUS);
	Tuple *uptime_tuple = dict_find(iter, MONITOR_UPTIME);
	Tuple *url_tuple = dict_find(iter, MONITOR_URL);

	APP_LOG(APP_LOG_LEVEL_DEBUG, "%s", name_tuple->value->cstring);

	if (name_tuple) {
		text_layer_set_text(name_text_layer, name_tuple->value->cstring);
		APP_LOG(APP_LOG_LEVEL_DEBUG, "%d", status_tuple->value->int16);
		/*switch (status_tuple->value->int16) {
			case 0:
				status_icon_large = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_PAUSE_ICON_SMALL);
				break;
			case 1:
				status_icon_large = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_QUESTION_ICON_SMALL);
				break;
			case 2:
				status_icon_large = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_CHECK_ICON_SMALL);
				break;
			case 8:
				status_icon_large = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_X_ICON_SMALL);
				break;
			case 9:
				status_icon_large = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_X_ICON_SMALL);
				break;
			default:
				status_icon_large = NULL;
				break;
		}*/

		bitmap_layer_set_bitmap(status_icon_layer, status_icon_large);
		text_layer_set_text(uptime_text_layer, uptime_tuple->value->cstring);
		text_layer_set_text(url_text_layer, url_tuple->value->cstring);
	}
}
