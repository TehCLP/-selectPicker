

(function ($) {

    var monthTH = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
        , monthEN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        , today = new Date()
        , $day, $month, $year
        , _lang, _minDate, _maxDate, _timeAfter, _holiday

    if (!(Date.prototype.addDays)) {
        Date.prototype.addDays = function (days) {
            var dat = new Date(this.valueOf());
            dat.setDate(dat.getDate() + days);
            return dat;
        }
    }

    function initial(o) {

        $day = $(o.idDay);
        $month = $(o.idMonth);
        $year = $(o.idYear);

        _lang = o.language;

        _minDate = o.minDate == '' ? '' : new Date(o.minDate);
        _maxDate = o.maxDate == '' ? '' : new Date(o.maxDate);

        _timeAfter = (o.timeAfter == '' ? '' : o.timeAfter).replace(/\./g, '');

        _holiday = o.holiday;

        console.log('getTime() : ', getTime());
        console.log('_timeAfter : ', _timeAfter);
        console.log('today : ', today);

        console.log(o.holiday);

        fillDate(today.getMonth() + 1, today.getFullYear(), true, true);

        $month.on('change', function () {
            //console.log('month : ', $(this).val())
            changeDate($(this).val(), $year.val(), false, false);
        });

        $year.on('change', function () {
            //console.log('year : ', $(this).val())
            changeDate($month.val(), $(this).val(), true, false);
        });
    }

    function changeDate(m, y, flagMonth, flagYear) {

        if (_lang == 'th') {
            y = y - 543
        }

        fillDate(m, y, flagMonth, flagYear);

    }

    function fillDate(m, y, flagMonth, flagYear) {
        //console.log(m, y, flagMonth, flagYear);

        if (flagMonth) {
            fillMonth(y);
            m = $month.val()
        }

        if (flagYear)
            fillYear();

        fillDay(m, y);
    }
    function fillDay(m, y) {

        var dateStart = 1
            , dayInMonth = new Date(y, m, 0).getDate() + 1
            , d = $day.val() || ''
            , nAddDay = chkHoliday()

        if (nAddDay < 1 && chkTimeAfter()) {
            nAddDay = 1;
        }

        today = today.addDays(nAddDay);


        if (_maxDate != '') {
            if (y == _maxDate.getFullYear()) {
                if (m == _maxDate.getMonth() + 1) {
                    dayInMonth = _maxDate.getDate() + 1;
                }
            }
        }

        if (y == today.getFullYear() && m == today.getMonth() + 1 && _minDate == '')
            dateStart = today.getDate();

        if (_minDate != '') {
            if (y == _minDate.getFullYear()) {
                if (m == _minDate.getMonth() + 1) {
                    dateStart = _minDate.getDate();
                }
            }
        }
        //console.log('dateStart : ', dateStart);
        //console.log('dayInMonth : ', dayInMonth);

        $day.empty();
        for (var i = dateStart; i < dayInMonth; i++) {
            $day.append('<option value="' + i + '">' + (i) + '</option>').val(i);
        }

        if (d == '') {
            $day.val(today.getDate());
        } else {
            if (dateStart > d)
                $day.val(dateStart);
            else if (d < dayInMonth)
                $day.val(d);
            else
                $day.val(dayInMonth - 1);
        }
    }
    function fillMonth(y) {

        var _arrMonth = monthEN
            , monthStart = 1
            , maxMonth = 13
            , mo = $month.val() || ''

        if (_maxDate != '') {
            if (y == _maxDate.getFullYear())
                maxMonth = _maxDate.getMonth() + 1 + 1;
        }

        if (_lang == 'th')
            _arrMonth = monthTH;

        if (_minDate != '') {
            if (y == _minDate.getFullYear())
                monthStart = _minDate.getMonth() + 1;
        } else if (y == today.getFullYear()) {
            monthStart = today.getMonth() + 1;
        }

        $month.empty();
        for (var i = monthStart; i < maxMonth; i++) {
            $month.append('<option value="' + i + '">' + _arrMonth[i - 1] + '</option>');
        }

        if (mo == '') {
            $month.val(today.getMonth() + 1);
        } else {
            if (mo < monthStart)
                $month.val(monthStart);
            else if (mo > maxMonth - 1)
                $month.val(maxMonth - 1)
            else
                $month.val(mo);
        }
    }
    function fillYear() {

        var yearStart = yearEnd = yearNow = today.getFullYear()
            , tmp
            , yy = $year.val() || ''

        if (_minDate != '')
            yearStart = _minDate.getFullYear();

        if (_maxDate != '') {
            tmp = _maxDate.getFullYear() - yearNow + 1;
            yearEnd += tmp;
        } else {
            yearEnd += 2;
        }

        if (_lang == 'th') {
            yearStart += 543;
            yearEnd += 543
            yearNow += 543;
        }

        for (var i = yearStart; i < yearEnd; i++) {
            tmp = yearStart++;
            $year.append('<option value="' + tmp + '">' + (tmp) + '</option>');
        }

        if (yy == '')
            $year.val(yearNow);
    }

    function getTime() {
        var h = today.getHours()
            , m = today.getMinutes()

        h = (h < 10 ? '0' : '') + h;
        m = (m < 10 ? '0' : '') + m

        return parseInt(h + m);
    }
    function chkTimeAfter() {
        var isAfter = false;
        if (_timeAfter != '') {
            if (getTime() >= _timeAfter) {
                isAfter = true;
            }
        }
        return isAfter;
    }

    function chkHoliday() {

        var _addDay = 0;

        if (_holiday.startDate != '' && _holiday.endDate != '') {
            
            var isTimeAfter = chkTimeAfter();

            if (chkDayInRange(_holiday.startDate, _holiday.endDate)) {

                if (!(cDate2Int(_holiday.startDate) == cDate2Int(today) && !isTimeAfter)) {
                    _addDay = calDateDiff(today, _holiday.toDate)
                }

            } else if (isTimeAfter) {

                _addDay = 1

            }
        }

        return _addDay;
    }
    function chkDayInRange(sdate, edate, date) {

        date = date || today;

        var _dt = cDate2Int(date)
            , _ds = cDate2Int(sdate)
            , _de = cDate2Int(edate)
            , v = _dt <= _de && _dt >= _ds

        return v
    }
    function cDate2Int(date) {
        // date format => yyyy-mm-dd or [object Date]

        var _dt = '';
        switch (Object.prototype.toString.call(date)) {
            case '[object Date]':
                var dd = date.getDate();
                dd = dd < 10 ? '0' + dd : '' + dd;
                var mm = date.getMonth() + 1;
                mm = mm < 10 ? '0' + mm : '' + mm;
                _dt = parseInt(date.getFullYear() + mm + dd);
                break;
            case '[object String]':
                _dt = parseInt(date.replace(/-/g, ''));
                break;
        }

        return _dt
    }
    function calDateDiff(sdate, edate) {
        // date format => yyyy-mm-dd

        var _dt = new Date(sdate)
            , _ds = cDate2Int(sdate)
            , _de = cDate2Int(edate)
            , n = 0

        while (_ds < _de) {

            _dt = _dt.addDays(1);
            _ds = cDate2Int(_dt);
            n++;
        }

        return n;
    }

    window.$selectPicker = window.$selectPicker || {

        init: function (options) {

            var opt = $.extend({

                idDay: ''
                , idMonth: ''
                , idYear: ''
                , language: 'en'
                , minDate: '' // '2014-10-01'
                , maxDate: '' // '2016-10-01'
                , timeAfter: '' // 16.00

                , holiday: {
                    startDate: '' // '2016-10-01'  // วันที่ เริ่มหยุด
                    , endDate: '' // '2016-10-01'  // ถึงวันที่
                    , toDate: '' // '2016-10-01'  // วันที่ กำหนด ให้คุ้มครอง
                }
            }, options);

            initial(opt);
        },

        checkDayInRange: function (sDate, eDate, checkDate) {
            checkDate = checkDate || new Date();
            return chkDayInRange(sDate, eDate, checkDate);
        },

        getDateDiff: function (sDate, eDate) {
            return calDateDiff(sDate, eDate);
        }
    };

})(jQuery);

