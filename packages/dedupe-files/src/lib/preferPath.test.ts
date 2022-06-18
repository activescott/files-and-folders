import { it, expect } from "@jest/globals"
import { preferredFileComparer, FileInfo } from "./preferPath.js"

/* eslint-disable no-magic-numbers */
function testBothOrders(preferable: FileInfo, undesirable: FileInfo): void {
  expect(preferredFileComparer(preferable, undesirable)).toBeLessThanOrEqual(-1)
  expect(preferredFileComparer(undesirable, preferable)).toBeGreaterThanOrEqual(
    1
  )
}

it("should not prefer postfix: 1", () => {
  testBothOrders(
    {
      path: "/Volumes/audio/Music/Run the Jewels/Run The Jewels 2/11 Angel Duster.mp3",
      priority: 0,
    },
    {
      path: "/Volumes/audio/Music/Run the Jewels/Run The Jewels 2/11 Angel Duster 1.mp3",
      priority: 0,
    }
  )
})

it("should not prefer postfix: (1)", () => {
  testBothOrders(
    {
      path: "/Volumes/audio/Music/Run the Jewels/Run The Jewels 2/11 Angel Duster.mp3",
      priority: 0,
    },
    {
      path: "/Volumes/audio/Music/Run the Jewels/Run The Jewels 2/11 Angel Duster (1).mp3",
      priority: 0,
    }
  )
})

it("should not prefer postfix - 1", () => {
  testBothOrders(
    {
      path: "/Volumes/audio/Music/Run the Jewels/Run The Jewels 2/11 Angel Duster.mp3",
      priority: 0,
    },
    {
      path: "/Volumes/audio/Music/Run the Jewels/Run The Jewels 2/11 Angel Duster - 1.mp3",
      priority: 0,
    }
  )
})

it("should not prefer postfix-1", () => {
  testBothOrders(
    {
      path: "/Volumes/audio/Music/Run the Jewels/Run The Jewels 2/11 Angel Duster.mp3",
      priority: 0,
    },
    {
      path: "/Volumes/audio/Music/Run the Jewels/Run The Jewels 2/11 Angel Duster-1.mp3",
      priority: 0,
    }
  )
})

it("should prefer shorter one when both end in numbers", () => {
  testBothOrders(
    {
      path: "/Volumes/audio/Music/Qari Wahid Zafar Qasmi/The Holy Quran With English Translation/09 03 Surah Aale Imran, Pt.  1.m4a",
      priority: 0,
    },
    {
      path: "/Volumes/audio/Music/Qari Wahid Zafar Qasmi/The Holy Quran With English Translation/09 03 Surah Aale Imran, Pt.  1 1.m4a",
      priority: 0,
    }
  )
})
