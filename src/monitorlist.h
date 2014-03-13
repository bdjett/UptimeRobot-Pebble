#pragma once

void monitorslist_init(void);
void monitorslist_show();
void monitorslist_destroy(void);
void monitorslist_in_received_handler(DictionaryIterator *iter);
bool monitorslist_is_on_top();
