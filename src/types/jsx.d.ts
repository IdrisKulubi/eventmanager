import { JSX as ReactJSX } from 'react'
import { Overwrite } from '@react-three/fiber'
import { NativeElements } from '@react-three/fiber/dist/declarations/src/three-types'

export module JSX {
  export type ElementType = ReactJSX.ElementType
  export interface Element extends ReactJSX.Element {}
  export interface ElementClass extends ReactJSX.ElementClass {}
  export interface ElementAttributesProperty extends ReactJSX.ElementAttributesProperty {}
  export interface ElementChildrenAttribute extends ReactJSX.ElementChildrenAttribute {}
  export type LibraryManagedAttributes<C, P> = ReactJSX.LibraryManagedAttributes<C, P>
  export interface IntrinsicAttributes extends ReactJSX.IntrinsicAttributes {}
  export interface IntrinsicClassAttributes<T> extends ReactJSX.IntrinsicClassAttributes<T> {}
  export type IntrinsicElements = Overwrite<
    ReactJSX.IntrinsicElements,
    NativeElements
  >
} 