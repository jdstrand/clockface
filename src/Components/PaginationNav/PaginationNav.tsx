// Libraries
import React, {forwardRef, useState, useEffect} from 'react'
import classnames from 'classnames'

// Components
import {PaginationItem} from './PaginationItem'
import {PaginationDirectionItem} from './PaginationDirectionItem'
import {PaginationTruncationItem} from './paginationTruncationItem'

// Styles
import './Pagination.scss'

// Types
import {StandardFunctionProps, Direction, ComponentSize} from '../../Types'

export interface PaginationNavProps extends StandardFunctionProps {
  /** Total nuber of pages there exists */
  totalPages: number
  /** currently active page */
  currentPage: number
  /** Function to be called on page change */
  onChange: (page: number) => void
  /** Determines how many pages are displayed within the nav.
   * For Example, pageRangeOffset =1 will result in 7 items -> {1,...,(4),5,(6),...20},
   * pageRangeOffset = 2 will result in 9 items ->  {1,...,(4,5),6,(7,8)...20},
   * pageRangeOffset = 3 will result in 11 items -> {1,...,(4,5,6),7,(8,9,10)...20} and so on
   * The compute functions will need to be refactored to provide more flexible range*/
  pageRangeOffset: number
  hideDirectionIcon?: boolean
  size?: ComponentSize
}

export type PaginationNavRef = HTMLElement

export const Pagination = forwardRef<PaginationNavRef, PaginationNavProps>(
  (
    {
      id,
      style,
      testID = 'pagination-nav',
      className,
      totalPages,
      currentPage = 1,
      onChange,
      pageRangeOffset = 1,
      hideDirectionIcon = false,
      size = ComponentSize.Medium,
    },
    ref
  ) => {
    const paginationNavClassName = classnames('cf-pagination', {
      [`${className}`]: className,
    })
    const [activePage, setActivePage] = useState(currentPage)

    const computePageSpread = (page: number, pageOffset: number) => {
      const itemsToShow = 5 + 2 * (pageOffset >= 1 ? pageOffset : 1)
      if (totalPages > itemsToShow) {
        const firstItem = Math.max(2, page - pageOffset)
        const lastItem = Math.min(totalPages - 1, page + pageOffset)

        const isLeftTruncated = firstItem > 2
        const isRightTruncated = totalPages - lastItem > 1

        const overflowOffset = itemsToShow - 4 - (lastItem - firstItem)

        if (isLeftTruncated && !isRightTruncated) {
          //if left is truncated but right isn't, take off the overflow from left
          return {
            firstBreakpoint: firstItem - overflowOffset,
            secondBreakpoint: lastItem,
          }
        }

        if (!isLeftTruncated && isRightTruncated) {
          //if right is truncated but left isn't, add the overflow to right
          return {
            firstBreakpoint: firstItem,
            secondBreakpoint: lastItem + overflowOffset,
          }
        }
        return {
          firstBreakpoint: firstItem,
          secondBreakpoint: lastItem,
        }
      } else {
        return {
          // if we don't need truncation
          firstBreakpoint: 2,
          secondBreakpoint: totalPages - 1,
        }
      }
    }

    const [breakpoints, setBreakpoints] = useState(
      computePageSpread(activePage, pageRangeOffset)
    )

    const moveToPage = (page: number) => {
      if (page !== activePage) {
        //if trying to move to page 0, lower than 0,  greater than total pages, or to the current page, don't change
        if (page >= 1 && page <= totalPages) {
          setActivePage(page)
          onChange(page)
        }
      }
    }

    useEffect(() => {
      setBreakpoints(computePageSpread(activePage, pageRangeOffset))
    }, [totalPages, pageRangeOffset])

    useEffect(() => {
      setActivePage(activePage)
      if (activePage > breakpoints.secondBreakpoint) {
        setBreakpoints(computePageSpread(activePage, pageRangeOffset))
      } else if (activePage < breakpoints.firstBreakpoint) {
        setBreakpoints(computePageSpread(activePage, pageRangeOffset))
      }
    }, [activePage])

    const checkActive = (page: number) => {
      return activePage === page ? true : false
    }

    //To-Do : There's a requirement to make the page item counts responsive to the size of the container. I think you can use the width in the below object to do this.
    /* if (paginationNavRef.current) {
    console.log(paginationNavRef.current.getBoundingClientRect())
  } */

    return (
      <nav
        className={paginationNavClassName}
        data-testid={testID}
        id={id}
        style={style}
        ref={ref}
      >
        <ul className="cf-pagination--container">
          {!hideDirectionIcon && (
            <PaginationDirectionItem
              direction={Direction.Left}
              onClick={() => moveToPage(activePage - 1)}
              size={size}
            />
          )}
          {
            <PaginationItem
              page={1}
              isActive={checkActive(1)}
              onClick={() => moveToPage(1)}
              size={size}
            />
          }
          {breakpoints.firstBreakpoint > 2 && (
            // compute whether it should be an ellipse or a number
            <PaginationTruncationItem size={size}></PaginationTruncationItem>
          )}
          {[...Array(totalPages)]
            .map((_, i) => i)
            .slice(
              breakpoints.firstBreakpoint,
              breakpoints.secondBreakpoint + 1
            )
            .map(item => (
              <PaginationItem
                page={item}
                isActive={checkActive(item)}
                onClick={() => moveToPage(item)}
                key={'pagination--item-' + item}
                size={size}
              />
            ))}
          {// compute whether it should be an ellipse or a number
          breakpoints.secondBreakpoint !== totalPages - 1 && (
            <PaginationTruncationItem size={size}></PaginationTruncationItem>
          )}
          {//compute last number
          totalPages !== 1 && (
            <PaginationItem
              page={totalPages}
              isActive={checkActive(totalPages)}
              onClick={() => moveToPage(totalPages)}
              size={size}
            />
          )}
          {!hideDirectionIcon && (
            <PaginationDirectionItem
              direction={Direction.Right}
              onClick={() => moveToPage(activePage + 1)}
              size={size}
            />
          )}
        </ul>
      </nav>
    )
  }
)

Pagination.displayName = 'PaginationNav'
