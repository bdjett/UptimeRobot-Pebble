#pragma once

void details_init(void);
void details_show();
void details_destroy(void);
void details_in_received_handler(DictionaryIterator *iter);
bool details_is_on_top();
void getDetails(char monitorId[25]);
