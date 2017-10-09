(function ($) {
  let $containerRow;
  let containerRowId;
  let $tableDiv;
  let $table;
  let $tbody;
  let $paginationDiv;
  let $paginationNav;
  let $paginationUl;
  let totalDataItems; //Total data items
  let totalPage; //Total page
  let columns; //Column number
  let rowLoops;  //Row fill loop times
  let methods = {};
  let $currentPageIndex;
  let $targetPage;
  let targetPage; //Target page 目标页码
  let currentPage;  //Current page 当前所在页码
  let firstPageInScreen;  //First page in current navigation screen 当前一组页码导航屏中的第一页
  let lastPageInScreen;   //Last page in current navigation screen 当前一组页码导航屏中的最后一页 
  let settings;   //Definde settings
  let defaultOption = {
    itemPerPage: 20,
    pageNavsPerSreen: 10,
    tabelStyle: "table table-striped table-hover table-condensed table-responsive",
    paginationStyle: "pagination",
    paginationActiveStyle: "active",
    showSeqNoColoumn: true,
    showEditColoumn: false
  };


  $.fn.tableAdapter = function (options) {
    $containerRow = $(this);
    containerRowId = $containerRow.attr('id');
    _attachPaginationEventsfunction();
    //Definde default Option
    options = options || {};
    let arg = Array.prototype.slice.call(arguments, 0, 1);
    if (methods[arg]) {
      return methods[arg].apply(this, arg);
    } else if (typeof arg === 'object' || arg) {
      return methods.initialize.apply(this, arg);
    } else {
      throw new TypeError('The options is invaild');
    }

    return this;
    // ...
  };


  //**----------------------Bind event for pages--------------------------- */
  let _attachPaginationEventsfunction = function () {
    /* $(`#${containerRowId}`).on('click', '.pagination', function () {
      alert('OK');
    }) */
    $containerRow.off('click', 'li.pageElement').on('click', 'li.pageElement', function () {
      $targetPageIndex = $(this);
      let targetPage = parseInt($targetPageIndex.val());
      _updatePageIndexAndFlipPage(targetPage);
      return false;
    });

    $containerRow.off('click', 'li.stepPageChange').on('click', 'li.stepPageChange', function () {
      let nextOrPrevValue = $(this).attr('value');
      targetPage = nextOrPrevValue === 'next' ? currentPage + 1 : currentPage - 1;
      $targetPageIndex = $(`li[value=${targetPage}]`);
      _updatePageIndexAndFlipPage(targetPage);
      return false;
    });
  }

  //**--------------------------------------------------------------------- */


  /***Initialize all setting and parameter */
  let initializeAllParas = function () {
    $containerRow.empty();
    targetPage = 1;
    currentPage = null;
  }
  //** */


  // Private function for debugging.
  let _fillTable = function () {
    initializeAllParas();
    //Tag The Target Page is 1
    $tableDiv = $(`<div class="col-md-12"></div>`).appendTo($containerRow); //Add a table div container
    $table = $(`<table class="${settings.tabelStyle}"></table>`).appendTo($tableDiv); //Add a table to div container
    totalDataItems = settings.data.length;  //Count total data items
    totalPage = totalDataItems > settings.itemPerPage ? Math.ceil(totalDataItems / settings.itemPerPage) : 1; //Calculate the total page
    columns = settings.columnFillText.length; //Count the column number
    rowLoops = totalDataItems > settings.itemPerPage ? settings.itemPerPage : totalDataItems;  //Count the row fill loop times, this loops times equal to settings.itemPerPage
    let $thead = $(`<thead></thead>`).appendTo($table); //Add thead to table
    let $rowInThead = $(`<tr></tr>`).appendTo($thead);  //Add a row to thead

    if (settings.showSeqNoColoumn) {
      //If 'showSeqNoColoumn' attribute is ture
      $rowInThead.append(`<th>Seq.</th>`);  //add Seq Field to tr in thead
      columns = columns + 1;  //And increase the columns number
    }

    let loops = settings.showSeqNoColoumn ? columns - 1 : columns;  //Count the loop times in a table row
    //Loop to fill the thead
    for (let i = 0; i < loops; i++) {
      let columnContent = settings.columnFillText[i];
      if (typeof columnContent === 'string') {
        //The thead content must bu string type
        $rowInThead.append(`<th>${settings.columnFillText[i]}</th>`);
      } else {
        throw new TypeError('The columnFillText must be a string', 'table_adapter.js', 21);
      }
    }

    if (totalDataItems > 0) {
      //When the passed in data array length greater than 0, create tbody and loop fill the tbody
      $tbody = $(`<tbody></tbody>`).appendTo($table);
      for (let i = 0; i < rowLoops; i++) {
        let currentElement = settings.data[(targetPage - 1) * rowLoops + i];
        let currentRow = $(`<tr></tr>`).appendTo($tbody);
        for (let j = 0; j < columns; j++) {
          let value;
          if (settings.showSeqNoColoumn) {
            if (j === 0) {
              value = i + 1;
            } else {
              if (currentElement[j - 1]) {
                value = currentElement[j - 1];
              } else {
                value = 'null'; //If value is not exist, fill 'null' instead
              }
            }
          } else {
            if (currentElement[j]) {
              value = currentElement[j];
            } else {
              value = 'null'; //If value is not exist, fill 'null' instead
            }
          }
          currentRow.append(`<td>${value}</td>`);
        }
      }
    }

    if (totalPage >= 1) {
      //If total page greater than 1, create div container and loop fill pagination
      let paginationFillLoops = totalPage > settings.pageNavsPerSreen ? settings.pageNavsPerSreen : totalPage;  //Count the pagination fill loop times
      $paginationDiv = $(`<div class="col-md-12"></div>`).appendTo($containerRow);  //Create pagination container and append to parent row jquery object
      $paginationNav = $(`<nav aria-label="data pages"></nav>`).appendTo($paginationDiv);   //Create and append NAV
      $paginationUl = $(`<ul class="${settings.paginationStyle}"></ul>`).appendTo($paginationNav); //Cread page element list ul element

      _fillPageIndex(1, true);
    }
  };

  //**---------------------------------- */


  //**-----------------------------Refill page index navigation------------------------------------------*/
  let _fillPageIndex = function (targetPage, isForward) {
    let startIndex;
    let endIndex;
    if (isForward) {
      startIndex = targetPage;
      if ((startIndex + settings.pageNavsPerSreen) < totalPage) {
        endIndex = targetPage + settings.pageNavsPerSreen - 1;
      } else {
        endIndex = startIndex + (totalPage - startIndex);
      }
    } else {
      if (totalPage > settings.pageNavsPerSreen) {
        startIndex = targetPage >= settings.pageNavsPerSreen ? targetPage - settings.pageNavsPerSreen + 1 : 1;
        endIndex = targetPage >= settings.pageNavsPerSreen ? targetPage : settings.pageNavsPerSreen;
      } else {
        startIndex = 1;
        endIndex = totalPage;
      }
    }
    $paginationUl.empty();
    for (let i = startIndex; i <= endIndex; i++) {
      //Loop fill page index li element
      if (i === startIndex) {
        if (i === 1) {
          if (totalPage > 1) {
            //When the index is 1, indicate it's the first page, so should also create previous page li element, and set different class to the first page index li element, also create and append a seperator '...' li element (but just set its display attribute to 'none')
            $paginationUl.append(`<li id="prevPageLi" class="stepPageChange" value="prev" style="cursor:pointer"><span aria-hidden="true">&laquo;</span></li>`);
            $tempCreatedPageIndex = $(`<li id="firstPage" class="firstPage pageElement" value="1" style="cursor:pointer"><span>1<span class="sr-only">(current)</span></span></li>`).appendTo($paginationUl);
          } else {
            $tempCreatedPageIndex = $(`<li id="firstPage" class="firstPage ${settings.paginationActiveStyle} pageElement" value="1" style="cursor:pointer"><span>1<span class="sr-only">(current)</span></span></li>`).appendTo($paginationUl);
          }
          firstPageInScreen = i;
        } else {
          $paginationUl.append(`<li id="prevPageLi" class="stepPageChange" value="prev" style="cursor:pointer"><span aria-hidden="true">&laquo;</span></li>`);
          $paginationUl.append(`<li id="firstPage" class="firstPage pageElement" value="1" style="cursor:pointer"><span>1<span class="sr-only">(current)</span></span></li>`);
          $paginationUl.append(`<li id="frontPageIndexSeperator" class="disabled"><span>...</span></li>`);
          $tempCreatedPageIndex = $(`<li id="firstPageInScreen" class="firstPageInScreen pageElement" style="cursor:pointer" value="${i}"><span>${i}</span></li>`).appendTo($paginationUl);
          firstPageInScreen = i;
        }
        if (i === targetPage) {
          currentPage = i;
          $currentPageIndex = $tempCreatedPageIndex;
          $currentPageIndex.addClass('active');
        }
      } else if (i > startIndex && i < endIndex) {
        $tempCreatedPageIndex = $(`<li class="pageElement" style="cursor:pointer" value="${i}"><span>${i}</span></li>`).appendTo($paginationUl);
        if (i === targetPage) {
          currentPage = i;
          $currentPageIndex = $tempCreatedPageIndex;
          $currentPageIndex.addClass('active');
        }
      } else if (i === endIndex) {
        //When the index is the last page
        if (totalPage > settings.pageNavsPerSreen) {
          if (i < totalPage) {
            //If the total page is not albe to fill in one screen
            $tempCreatedPageIndex = $(`<li id="lastPageInScreen" class="lastPageInScreen pageElement" style="cursor:pointer" value="${i}"><span>${i}</span></li>`).appendTo($paginationUl);
            $paginationUl.append(`<li id="backPageIndexSeperator" class="disabled"><span>...</span></li>`); //Create and append a seperator '...' li element
            $paginationUl.append(`<li id="lastPage" class="lastPage pageElement" style="cursor:pointer" value="${totalPage}"><span>${totalPage}</span></li>`);
          } else if (i === totalPage) {
            $tempCreatedPageIndex = $(`<li id="lastPage" class="lastPage pageElement" style="cursor:pointer" value="${totalPage}"><span>${totalPage}</span></li>`).appendTo($paginationUl);
          }
        } else {
          $paginationUl.append(`<li id="lastPage" class="lastPage pageElement" style="cursor:pointer" value="${i}"><span>${i}</span></li>`);
        }
        $paginationUl.append(`<li id="nextPageLi" class="stepPageChange" value="next" style="cursor:pointer"><span aria-hidden="true">&raquo;</span></li>`);
        lastPageInScreen = i;
        if (i === targetPage) {
          currentPage = i;
          $currentPageIndex = $tempCreatedPageIndex;
          $currentPageIndex.addClass('active');
        }
      }
    }
  }

  //**------------------------------------------------------------------------------------------------------- */




  //**-----------------------------Update Page Index Li---------------------------------- */
  let _updatePageIndexAndFlipPage = function (targetPage) {
    if (targetPage === currentPage && targetPage !== firstPageInScreen && targetPage !== lastPageInScreen) {
      alert(`已经是第${currentPage}了！`);
    } else {
      if (targetPage < 1 || targetPage > totalPage) {
        alert(`已经没有更多了！`);
      } else if (targetPage === 1) {
        if (targetPage !== firstPageInScreen) {
          //从第一页开始向后更新页码索引，隐藏前面的分隔点，根据总页数与每页目录索引数的大小关系决定后面的分隔点是否隐藏
          _flipPage(targetPage, rowLoops, (targetPage - 1) * rowLoops);
          _fillPageIndex(targetPage, true);
        } else {
          //正常的翻页，不更新页码索引
          _flipPage(targetPage, rowLoops, (targetPage - 1) * rowLoops, function () {
            $currentPageIndex.removeClass('active');
            $targetPageIndex.addClass('active');
            $currentPageIndex = $targetPageIndex;
            currentPage = targetPage;
          });
        }
        if (currentPage < settings.pageNavsPerSreen) {
          //如果还在第一个翻页屏，则仅仅更新到第一页即可
          _flipPage(targetPage, rowLoops, (targetPage - 1) * rowLoops);
        } else {
          //如果已经不在第一个翻页屏了，则需要从第一页往后更新页码导航条
        }
      } else if (targetPage === firstPageInScreen) {
        //从后向前更新页码索引，根据总页数与每页目录索引数的大小关系决定前面和后面的分隔点是否隐藏
        _flipPage(targetPage, rowLoops, (targetPage - 1) * rowLoops);
        _fillPageIndex(targetPage, false);
      } else if (targetPage > firstPageInScreen && targetPage < lastPageInScreen) {
        //正常的翻页，不更新页码索引
        _flipPage(targetPage, rowLoops, (targetPage - 1) * rowLoops, function () {
          $currentPageIndex.removeClass('active');
          $targetPageIndex.addClass('active');
          $currentPageIndex = $targetPageIndex;
          currentPage = targetPage;
        });
      } else if (targetPage < firstPageInScreen && targetPage < lastPageInScreen) {
        //从后向前更新页码索引
        _flipPage(targetPage, rowLoops, (targetPage - 1) * rowLoops);
        _fillPageIndex(targetPage, false);
      } else if (targetPage === lastPageInScreen && targetPage !== totalPage) {
        //从前往后更新页码索引，根据总页数与每页目录索引数的大小关系决定前面和后面的分隔点是否隐藏
        _flipPage(targetPage, rowLoops, (targetPage - 1) * rowLoops);
        _fillPageIndex(targetPage, true);
      } else if (targetPage === lastPageInScreen && targetPage === totalPage) {
        //如果最后一页既是最后一页也是当前屏的最后一页，则正常的翻页，不更新页码索引
        _flipPage(targetPage, (totalDataItems - (targetPage - 1) * rowLoops), (targetPage - 1) * rowLoops, function () {
          $currentPageIndex.removeClass('active');
          $targetPageIndex.addClass('active');
          $currentPageIndex = $targetPageIndex;
          currentPage = targetPage;
        });
      } else if (targetPage === totalPage) {
        //从最后一页向前更新页码索引，隐藏后面的分隔点，根据总页数与每页目录索引数的大小关系决定前面的分隔点是否隐藏
        _flipPage(targetPage, (totalDataItems - (targetPage - 1) * rowLoops), (targetPage - 1) * rowLoops);
        _fillPageIndex(targetPage, false);
      }
    }
  }

  //**------------------------------------------------------------------------------------ */

  //**-------------------------------------flip page------------------------------------- */
  let _flipPage = function (targetPage, rowLoopsWhenFlipPage, seqOffset, callback) {
    $tbody.empty();
    // let subDataArray = settings.data.slice((targetPage - 1) * rowLoops, targetPage * rowLoops);
    for (let i = 0; i < rowLoopsWhenFlipPage; i++) {
      let currentElement = settings.data[(targetPage - 1) * rowLoopsWhenFlipPage + i];
      let currentRow = $(`<tr></tr>`).appendTo($tbody);
      for (let j = 0; j < columns; j++) {
        let value;
        if (settings.showSeqNoColoumn) {
          if (j === 0) {
            value = seqOffset + i + 1;
          } else {
            if (currentElement[j - 1]) {
              value = currentElement[j - 1];
            } else {
              value = 'null'; //If value is not exist, fill 'null' instead
            }
          }
        } else {
          if (currentElement[j]) {
            value = currentElement[j];
          } else {
            value = 'null'; //If value is not exist, fill 'null' instead
          }
        }
        currentRow.append(`<td>${value}</td>`);
      }
    }
    if (callback) {
      callback();
    } else {
      //DO NOTHING
    }
  }
  //***-------------------------------------------------------------------------- */

  // ...
  methods.initialize = function (options) {
    if (typeof options !== 'undefined' && typeof options.data !== 'undefined' && typeof options.columnFillText !== 'undefined') {
      if (Array.isArray(options.data) && Array.isArray(options.columnFillText)) {
        if (options.showEditColoumn === true) {
          if (typeof options.editcolumnFillRule === 'object') {
            if (Array.isArray(options.editcolumnFillRule.text) && Array.isArray(options.editcolumnFillRule.style) && Array.isArray(options.editcolumnFillRule.link)) {
              //If user passed some options to this plugins, overide the default options with user passed-in options
              settings = $.extend({}, defaultOption, options);
              _fillTable();
            } else {
              throw new TypeError('The option -- options.editcolumnFillRule.text, options.editcolumnFillRule.style or options.editcolumnFillRule.link must be Array', 'table_adapter.js', 21);
            }
          } else {
            throw new TypeError('The option -- editcolumnFillRule must be a object', 'table_adapter.js', 21);
          }
        } else {
          //If user passed some options to this plugins, overide the default options with user passed-in options
          settings = $.extend({}, defaultOption, options);
          _fillTable();
        }
      } else {
        throw new TypeError('The option -- data or columeFillRule must be a Array', 'table_adapter.js', 21);
      }
    } else {
      //If user did not pass in some options, set the default options as settings
      throw new Error('Plugin tableAdapter need necessary option field');
    }
  }

  methods.clear = function () {

  }


  // End of closure.

})(jQuery);