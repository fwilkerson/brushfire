import {h} from 'muve';

const styles = {
	loadingContainer: {
		bottom: '4rem',
		fontSize: '3rem',
		position: 'fixed',
		right: '4rem',
		zIndex: 1,
	},
};

export const Loading = props => (
	<div style={styles.loadingContainer}>
		<div class="loading">
			<span>.</span>
			<span>.</span>
			<span>.</span>
		</div>
	</div>
);
