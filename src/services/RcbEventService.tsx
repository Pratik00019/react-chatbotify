import { Message } from "../types/Message";
import { Settings } from "../types/Settings";
import { Styles } from "../types/Styles";
import { EventDetail } from "../types/internal/events/EventDetail";
import { RcbBaseEvent } from "../types/internal/events/RcbBaseEvent";
import { RcbEvent } from "../constants/RcbEvent";

// tracks if an event is cancellable
const cancellableMap = {
	[RcbEvent.TOGGLE_AUDIO]: true,
	[RcbEvent.TOGGLE_VOICE]: true,
	[RcbEvent.TOGGLE_NOTIFICATIONS]: true,
	[RcbEvent.TOGGLE_CHAT_WINDOW]: true,
	[RcbEvent.PRE_INJECT_MESSAGE]: true,
	[RcbEvent.POST_INJECT_MESSAGE]: false,
	[RcbEvent.START_STREAM_MESSAGE]: true,
	[RcbEvent.CHUNK_STREAM_MESSAGE]: true,
	[RcbEvent.STOP_STREAM_MESSAGE]: true,
	[RcbEvent.LOAD_CHAT_HISTORY]: true,
	[RcbEvent.CHANGE_PATH]: true,
	[RcbEvent.SHOW_TOAST]: true,
	[RcbEvent.DISMISS_TOAST]: true,
	[RcbEvent.USER_SUBMIT_TEXT]: true,
	[RcbEvent.USER_UPLOAD_FILE]: true
}

/**
 * Emits a custom event with specified name, detail and data.
 *
 * @param eventName name of the event to emit
 * @param eventDetail additional data to include with the event.
 */
export const emitRcbEvent = (eventName: typeof RcbEvent[keyof typeof RcbEvent], eventDetail: EventDetail, data: object,
	settings: Settings, styles: Styles, messages: Message[], paths: string[]): RcbBaseEvent => {

	// Create a custom event with the provided name and detail
	const event: RcbBaseEvent = new CustomEvent(eventName, {
		detail: eventDetail,
		cancelable: cancellableMap.eventName,
	}) as RcbBaseEvent<typeof data, EventDetail>;

	event.data = data;
	event.settings = settings;
	event.styles = styles;
	event.messages = messages;
	event.paths = paths;

	window.dispatchEvent(event);
	return event;
}
