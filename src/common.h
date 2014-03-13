#pragma once

typedef struct {
	char id[25];
	char name[128];
	char url[128];
	int status;
	char uptime[25];
	int index;
} Monitor;

enum {
	MONITOR_ID = 0x0,
	MONITOR_NAME = 0x1,
	MONITOR_URL = 0x2,
	MONITOR_STATUS = 0x3,
	MONITOR_UPTIME = 0x4,
	MONITOR_INDEX = 0x5,
	MONITOR_GET_DETAILS = 0x6,
};
