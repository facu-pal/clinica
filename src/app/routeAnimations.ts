import {
	trigger,
	transition,
	style,
	query,
	group,
	animate,
} from '@angular/animations';

export const animations =
	trigger('routeAnimations', [
	
		transition('* => isRight', slideTo('right')),
		transition('isLeft => *', slideTo('left')),
		transition('* => isLeft', slideTo('left')),
		transition('* => isTop', slideTo('top')),
		transition('* => isBottom', slideTo('bottom')),

		transition('* => *', fade()),
	]);

function slideTo(direction: 'left' | 'right' | 'top' | 'bottom') {
	const optional = { optional: true };
	return [
		query(':enter, :leave', [
			style({
				position: 'absolute',
				[direction]: 0,
				width: '100%'
			})
		], optional),
		query(':enter', [
			style({ [direction]: '-100%' })
		]),
		group([
			query(':leave', [
				animate('1000ms ease', style({ [direction]: '100%' }))
			], optional),
			query(':enter', [
				animate('1000ms ease', style({ [direction]: '0%' }))
			])
		]),
	];
}

function fade() {
	const optional = { optional: true };
	return [
		query(':enter, :leave', [
			style({
				position: 'absolute',
				left: 0,
				width: '100%',
				opacity: 0,
				transform: 'scale(0) translateY(0)',
			}),
		], optional),
		query(':leave', [
			style({ opacity: 1, transform: 'scale(1) translateY(0)' }),
			animate('200ms ease', style({ opacity: 0, transform: 'scale(0) translateY(0)' }))
		], optional),
		query(':enter', [
			animate('200ms ease', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
		], optional),

	];
}
