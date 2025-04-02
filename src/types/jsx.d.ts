import { JSX as ReactJSX } from 'react'
import { Overwrite } from '@react-three/fiber'
import { NativeElements } from '@react-three/fiber/dist/declarations/src/three-types'

export namespace JSX {
  export type ElementType = ReactJSX.ElementType;
  export type Element = ReactJSX.Element;
  export type ElementClass = ReactJSX.ElementClass;
  export type ElementAttributesProperty = ReactJSX.ElementAttributesProperty;
  export type ElementChildrenAttribute = ReactJSX.ElementChildrenAttribute;
  export type LibraryManagedAttributes<C, P> = ReactJSX.LibraryManagedAttributes<C, P>;
  export type IntrinsicAttributes = ReactJSX.IntrinsicAttributes;
  export type IntrinsicClassAttributes<T> = ReactJSX.IntrinsicClassAttributes<T>;
  export type IntrinsicElements = Overwrite<
    ReactJSX.IntrinsicElements,
    NativeElements
  >;
}
