import { useFirstInteractionInternal } from "./internal/useFirstInteractionInternal";

/**
 * External custom hook for managing user first interaction.
 */
export const useFirstInteraction = () => {
	// handles user first interaction
	const { hasFlowStarted, hasInteractedPage } = useFirstInteractionInternal();

	return {
		hasFlowStarted,
		hasInteractedPage
	};
};
