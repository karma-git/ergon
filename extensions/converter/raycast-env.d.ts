/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `img-to-pdf` command */
  export type ImgToPdf = ExtensionPreferences & {}
  /** Preferences accessible in the `heic-to-jpg` command */
  export type HeicToJpg = ExtensionPreferences & {}
  /** Preferences accessible in the `pdf-merge` command */
  export type PdfMerge = ExtensionPreferences & {}
  /** Preferences accessible in the `add-frame` command */
  export type AddFrame = ExtensionPreferences & {}
  /** Preferences accessible in the `view-queue` command */
  export type ViewQueue = ExtensionPreferences & {}
  /** Preferences accessible in the `finalize-pdf` command */
  export type FinalizePdf = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `img-to-pdf` command */
  export type ImgToPdf = {}
  /** Arguments passed to the `heic-to-jpg` command */
  export type HeicToJpg = {}
  /** Arguments passed to the `pdf-merge` command */
  export type PdfMerge = {}
  /** Arguments passed to the `add-frame` command */
  export type AddFrame = {}
  /** Arguments passed to the `view-queue` command */
  export type ViewQueue = {}
  /** Arguments passed to the `finalize-pdf` command */
  export type FinalizePdf = {}
}

