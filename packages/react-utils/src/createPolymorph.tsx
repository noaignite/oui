import type { DistributiveOmit, Overwrite } from '@noaignite/types'
import type {
  ComponentPropsWithRef,
  ElementType,
  Fragment,
  HTMLElementType,
  ReactElement,
  ReactPortal,
} from 'react'

type Props = Record<string, unknown>

/** Returns `keyof T` if it exists, otherwise fallback to `D` */
type PickOrDefault<T, K extends PropertyKey, D> = K extends keyof T ? Pick<T, K> : D

/**
 * Return `P` if `P['as']` is a valid `ElementType`, otherwise return a non-nullish value.
 */
type IfValidAs<P extends Props> = 'as' extends keyof P
  ? P['as'] extends ElementType
    ? P
    : NonNullable<unknown>
  : NonNullable<unknown>

/** Derived `as` prop from `P` if it matches `ElementType`. */
type AsOf<P extends Props> = 'as' extends keyof P
  ? P['as'] extends ElementType
    ? P['as']
    : ElementType
  : ElementType

/** Derived props of element `T` */
type PropsOf<T extends ElementType> = ComponentPropsWithRef<T>

/** Derived `ref` type of element `T`, provided one exists. */
type RefOf<T extends ElementType> = PropsOf<T>['ref']

/** Use `TT` if it is a valid `ElementType`, otherwise fallback to `T` */
type Tag<T extends ElementType, TT> = TT extends ElementType ? TT : T

/**
 * Return type of `PolymorphicExoticComponent`.
 * Functionally similar to `ReactNode`, but with additional restrictions.
 */
export type PolymorphicElement<P extends object, T extends ElementType> =
  | ReactElement<P, T>
  | ReactPortal
  | null
  | undefined

/**
 * Derives the entire set of props for a polymorphic component, combining
 * user-provided props `P`, with derived native props of element `T` whilst
 * attaching `"as"` and `"ref"` props to provide polymorphism support.
 */
export type PolymorphicProps<
  P extends Props = NonNullable<unknown>,
  T extends ElementType = HTMLElementType,
  O extends string = '',
> = DistributiveOmit<Overwrite<PropsOf<T>, P>, 'as' | 'ref' | O> &
  PickOrDefault<P & IfValidAs<PropsOf<T>>, 'as', { as?: T }> &
  PickOrDefault<P & IfValidAs<PropsOf<T>>, 'ref', { ref?: RefOf<T> }>

/**
 * Render function of `createPolymorph`.
 * Functionally similar to legacy `forwardRef` render functions.
 * Attaches `as` and `ref` props to provide polymorphism support.
 */
export type PolymorphicRenderFunction<
  P extends Props = NonNullable<unknown>,
  T extends ElementType = AsOf<P>,
  O extends string = '',
> = (props: PolymorphicProps<P, T, O>) => PolymorphicElement<P, T>

/**
 * Props definition for `PolymorphicExoticComponent`.
 * Currently an alias for `Record<string, unknown>`
 */
export type ExoticProps = Props

/**
 * Props definition for `PolymorphicExoticComponent`..
 * - `props` are applied as standard props to component.
 * - `overrides` are applied as props to non-fragment component.
 */
export type ExoticComplexProps = { props: Props; overrides: Props }

/**
 * Return type of `createPolymorph`.
 * Functionally similar to legacy `forwardRef` return types.
 * Attaches `as` and `ref` props to provide polymorphism support.
 */
export type PolymorphicExoticComponent<
  P extends ExoticProps | ExoticComplexProps,
  T extends ElementType = AsOf<P extends ExoticComplexProps ? P['props'] : P>,
  O extends string = '',
> = <
  TT = 'as' extends keyof P
    ? P['as'] extends ElementType
      ? P['as']
      : T
    : 'as' extends keyof P['props']
      ? P['props']['as'] extends ElementType
        ? P['props']['as']
        : T
      : T,
>(
  props: PolymorphicProps<
    P extends ExoticComplexProps
      ? Tag<T, TT> extends typeof Fragment
        ? P['props'] & Pick<P['overrides'], 'children'>
        : P['props'] & P['overrides']
      : P,
    Tag<T, TT>,
    O
  >,
) => PolymorphicElement<P, Tag<T, TT>>

/**
 * A utility function, enriching component types with polymorphism support.
 * Adds `as` and `ref` to component consumer interface, where `as` is used to
 * change the underlying element type and `ref` is used to access the underlying
 * element reference.
 *
 * @param render - Component function body to render.
 *
 * @returns A polymorphic component function.
 *
 * @example
 * ```tsx
 * type Props = { greeting: string }
 *
 * const Component = createPolymorph<Props, 'div'>(({ as: Tag = 'div', greeting, ...rest }) => {
 *   useEffect(() => { console.log(greeting) });
 *   return <Tag {...rest} />
 * })
 *
 * function App() {
 *   return (
 *     <>
 *       <Component greeting="Hello, World!" />
 *       <Component as="button" type="button" greeting="Hello, World!" />
 *       <Component as={Link} href="/" greeting="Hello, World!" />
 *     </>
 *   )
 * }
 * ```
 */
export const createPolymorph = <
  P extends ExoticProps | ExoticComplexProps,
  T extends ElementType,
  O extends string = '',
>(
  render: PolymorphicRenderFunction<
    P extends ExoticComplexProps ? P['props'] & P['overrides'] : P,
    T,
    O
  >,
) => render as PolymorphicExoticComponent<P, T, O>
