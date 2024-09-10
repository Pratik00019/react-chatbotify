import React, {
	useState,
	ChangeEvent,
	KeyboardEvent,
	RefObject,
	MouseEvent,
	Fragment,
} from "react";

import { isDesktop } from "../../utils/displayChecker";
import { useFirstInteractionInternal } from "../../hooks/internal/useFirstInteractionInternal";
import { useSubmitInputInternal } from "../../hooks/internal/useSubmitInputInternal";
import { useBotStatesContext } from "../../context/BotStatesContext";
import { useBotRefsContext } from "../../context/BotRefsContext";
import { useSettingsContext } from "../../context/SettingsContext";
import { useStylesContext } from "../../context/StylesContext";

import "./ChatBotInput.css";

/**
 * Contains chat input field for user to enter messages.
 * 
 * @param buttons list of buttons to render in the chat input
 */
const ChatBotInput = ({ buttons }: { buttons: JSX.Element[] }) => {
	// handles settings
	const { settings } = useSettingsContext();

	// handles styles
	const { styles } = useStylesContext();

	// handles bot states
	const { textAreaDisabled, textAreaSensitiveMode, inputLength, setInputLength } = useBotStatesContext();

	// handles bot refs
	const { inputRef } = useBotRefsContext();


	// tracks if chat input is focused
	const [isFocused, setIsFocused] = useState<boolean>(false);

	// handles flow start
	const { hasFlowStarted, setHasFlowStarted } = useFirstInteractionInternal();

	// handles user input submission
	const { handleSubmitText } = useSubmitInputInternal();

	// styles for text area
	const textAreaStyle: React.CSSProperties = {
		boxSizing: isDesktop ? "content-box" : "border-box",
		...styles.chatInputAreaStyle,
	};

	// styles for focused text area
	const textAreaFocusedStyle: React.CSSProperties = {
		outline: !textAreaDisabled ? "none" : "",
		boxShadow: !textAreaDisabled ? `0 0 5px ${settings.general?.primaryColor}` : "",
		boxSizing: isDesktop ? "content-box" : "border-box",
		...styles.chatInputAreaStyle, // by default inherit the base style for input area
		...styles.chatInputAreaFocusedStyle,
	};

	// styles for disabled text area
	const textAreaDisabledStyle: React.CSSProperties = {
		cursor: `url(${settings.general?.actionDisabledIcon}), auto`,
		caretColor: "transparent",
		boxSizing: isDesktop ? "content-box" : "border-box",
		...styles.chatInputAreaStyle, // by default inherit the base style for input area
		...styles.chatInputAreaDisabledStyle,
	};

	// styles for character limit
	const characterLimitStyle: React.CSSProperties = {
		color: "#989898",
		...styles.characterLimitStyle
	};

	// styles for character limit reached
	const characterLimitReachedStyle: React.CSSProperties = {
		color: "#ff0000",
		...styles.characterLimitReachedStyle
	};

	// styles for input placeholder
	const placeholder = textAreaDisabled
		? settings.chatInput?.disabledPlaceholderText
		: settings.chatInput?.enabledPlaceholderText;

	/**
	 * Handles focus event on chat input.
	 */
	const handleFocus = () => {
		if (textAreaDisabled) {
			return;
		}
		setIsFocused(true);
	};

	/**
	 * Handles blur event on chat input.
	 */
	const handleBlur = () => {
		setIsFocused(false);
	};

	/**
	 * Handles keyboard events and proceeds to submit user input if enter button is pressed.
	 * 
	 * @param event keyboard event
	 */ 
	const handleKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		if (event.key === "Enter") {
			if (event.shiftKey) {
				if (!settings.chatInput?.allowNewline) {
					event.preventDefault();
				}
				return;
			}
			event.preventDefault();
			await handleSubmitText();
		}
	};

	/**
	 * Handles textarea value changes.
	 * 
	 * @param event textarea change event
	 */
	const handleTextAreaValueChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		if (textAreaDisabled && inputRef.current) {
			// prevent input and keep current value
			inputRef.current.value = "";
			return;
		}

		if (inputRef.current) {
			const characterLimit = settings.chatInput?.characterLimit
			/*
			* @params allowNewline Boolean
			* allowNewline [true] Allow input values to contain line breaks "\n"
			* allowNewline [false] Replace \n with a space
			* */
			const allowNewline = settings.chatInput?.allowNewline
			const newInput = allowNewline ? event.target.value : event.target.value.replace(/\n/g, " ");
			if (characterLimit != null && characterLimit >= 0 && newInput.length > characterLimit) {
				inputRef.current.value = newInput.slice(0, characterLimit);
			} else {
				inputRef.current.value = newInput
			}
			setInputLength(inputRef.current.value.length);
		}
	};

	return (
		<div 
			onMouseDown={(event: MouseEvent) => {
				event.stopPropagation();
				// checks if user is interacting with chatbot for the first time
				if (!hasFlowStarted && settings.general?.flowStartTrigger === "ON_CHATBOT_INTERACT") {
					setHasFlowStarted(true);
				}
			}}
			style={styles.chatInputContainerStyle} 
			className="rcb-chat-input"
		>
			{/* textarea intentionally does not use the disabled property to prevent keyboard from closing on mobile */}
			{textAreaSensitiveMode && settings.sensitiveInput?.maskInTextArea ?
				<input
					ref={inputRef as RefObject<HTMLInputElement>}
					type="password"
					className="rcb-chat-input-textarea"
					style={textAreaDisabled
						? textAreaDisabledStyle
						: (isFocused ? textAreaFocusedStyle : textAreaStyle)}
					placeholder={placeholder}
					onChange={handleTextAreaValueChange}
					onKeyDown={handleKeyDown}
					onFocus={handleFocus}
					onBlur={handleBlur}
				/>
				:
				<textarea
					ref={inputRef as RefObject<HTMLTextAreaElement>}
					style={textAreaDisabled
						? textAreaDisabledStyle
						: (isFocused ? textAreaFocusedStyle : textAreaStyle)}
					rows={1}
					className="rcb-chat-input-textarea"
					placeholder={placeholder}
					onChange={handleTextAreaValueChange}
					onKeyDown={handleKeyDown}
					onFocus={handleFocus}
					onBlur={handleBlur}
				/>
			}
			<div className="rcb-chat-input-button-container">
				{buttons?.map((button: JSX.Element, index: number) => 
					<Fragment key={index}>{button}</Fragment>
				)}
				{settings.chatInput?.showCharacterCount
					&& settings.chatInput?.characterLimit != null
					&& settings.chatInput?.characterLimit > 0
					&&
					<div 
						className="rcb-chat-input-char-counter"
						style={inputLength >= settings.chatInput?.characterLimit
							? characterLimitReachedStyle
							: characterLimitStyle
						}
					>
						{inputLength}/{settings.chatInput?.characterLimit}
					</div>
				}
			</div>
		</div>
	);
};

export default ChatBotInput;
