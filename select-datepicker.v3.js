

(function ($) {
    'use strict'

    var monthTH = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
        , monthEN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        , today = new Date()

    if (!(Date.prototype.addDays)) {
        Date.prototype.addDays = function (days) {
            var dat = new Date(this.valueOf());
            dat.setDate(dat.getDate() + days);
            return dat;
        }
    }

    var selectPicker = function (o) {
        var self = this;

        self.today = new Date();

        self.$day = $(o.idDay);
        self.$month = $(o.idMonth);
        self.$year = $(o.idYear);

        self._lang = o.language;

        self._minDate = parseDate(o.minDate);
        self._minDateTmp = self._minDate;

        self._maxDate = parseDate(o.maxDate);

        self._timeAfter = (o.timeAfter == '' ? '' : o.timeAfter).replace(/[:\.]/g, '');

        self._arrAddDay = [];

        self._holiday = o.holiday;

        self.initial();
    }

    selectPicker.prototype = {
        initial: function () {

            var self = this;

            self.fillDate(self.today.getMonth() + 1, self.today.getFullYear(), true, true);

            self.$month.on('change', function () {
                self.fillDate($(this).val(), self.$year.val(), false, false);
            });

            self.$year.on('change', function () {
                self.fillDate(self.$month.val(), $(this).val(), true, false);
            });
        }, 

        fillDate: function (m, y, flagMonth, flagYear) {
            var self = this;

            self._arrAddDay = chkHoliday(self._holiday, self._timeAfter)

            if (self._arrAddDay[0] < 1 && chkTimeAfter(self._timeAfter)) {
                self._arrAddDay[0] = 1;
            }

            if (self._arrAddDay[0] > 0) {
                //self._minDate = new Date().addDays(self._arrAddDay[0]);
                self._minDate = (self._arrAddDay[1] ? new Date() : self._minDateTmp).addDays(self._arrAddDay[0]);
            }

            if (flagYear) {
                self.fillYear();
                y = self.$year.val();
            }

            if (self._lang == 'th') {
                y = y - 543
            }

            if (flagMonth) {
                self.fillMonth(y);
                m = self.$month.val()
            }

            self.fillDay(m, y);
        },
        fillDay: function (m, y) {
            var self = this
                , dateStart = 1
                , dayInMonth = new Date(y, m, 0).getDate() + 1
                , d = self.$day.val() || ''

            if (self._maxDate != '') {
                if (y == self._maxDate.getFullYear()) {
                    if (m == self._maxDate.getMonth() + 1) {
                        dayInMonth = self._maxDate.getDate() + 1;
                    }
                }
            }
            
            if (y == self.today.getFullYear() && m == self.today.getMonth() + 1 && self._minDate == '')
                dateStart = self.today.getDate();

            if (self._minDate != '') {
                if (y == self._minDate.getFullYear()) {
                    if (m == self._minDate.getMonth() + 1) {
                        dateStart = self._minDate.getDate();
                    }
                }
            }

            self.$day.empty();
            for (var i = dateStart; i < dayInMonth; i++) {
                self.$day.append('<option value="' + i + '">' + (i) + '</option>').val(i);
            }

            if (d == '') {
                if (dateStart > self.today.getDate() || self._arrAddDay[1])
                    self.$day.val(dateStart);
                else
                    self.$day.val(self.today.getDate());
            } else {
                if (dateStart > d)
                    self.$day.val(dateStart);
                else if (d < dayInMonth)
                    self.$day.val(d);
                else
                    self.$day.val(dayInMonth - 1);
            }
        },
        fillMonth: function (y) {
            var self = this
                , _arrMonth = monthEN
                , monthStart = 1
                , maxMonth = 13
                , mo = self.$month.val() || ''

            if (self._lang == 'th')
                _arrMonth = monthTH;

            if (self._maxDate != '') {
                if (y == self._maxDate.getFullYear())
                    maxMonth = self._maxDate.getMonth() + 1 + 1;
            }
            
            if (self._minDate != '') {
                if (y == self._minDate.getFullYear())
                    monthStart = self._minDate.getMonth() + 1;
            } else if (y == self.today.getFullYear()) {
                monthStart = self.today.getMonth() + 1;
            }

            self.$month.empty();
            for (var i = monthStart; i < maxMonth; i++) {
                self.$month.append('<option value="' + i + '">' + _arrMonth[i - 1] + '</option>');
            }

            if (mo == '') {
                if (monthStart > self.today.getMonth() + 1 || self._arrAddDay[1])
                    self.$month.val(monthStart);
                else
                    self.$month.val(self.today.getMonth() + 1);
            } else {
                if (mo < monthStart)
                    self.$month.val(monthStart);
                else if (mo > maxMonth - 1)
                    self.$month.val(maxMonth - 1)
                else
                    self.$month.val(mo);
            }
        },
        fillYear: function () {
            var self = this
                , yearNow = self.today.getFullYear()
                , yearStart = yearNow
                , yearEnd = yearNow
                , tmp
                , yy = self.$year.val() || ''

            if (self._minDate != '')
                yearStart = self._minDate.getFullYear();

            if (self._maxDate != '') {
                tmp = self._maxDate.getFullYear() - yearNow + 1;
                yearEnd += tmp;
            } else {
                yearEnd += 2;
            }

            if (self._lang == 'th') {
                yearStart += 543;
                yearEnd += 543
                yearNow += 543;
            }

            self.$year.empty();
            tmp = yearStart;
            for (var i = yearStart; i < yearEnd; i++) {
                self.$year.append('<option value="' + tmp + '">' + (tmp) + '</option>');
                tmp++;
            }

            if (yy == '') {
                if (yearStart > yearNow)
                    self.$year.val(yearStart);
                else
                    self.$year.val(yearNow);
            }
        }

    }
    selectPicker.prototype.constructor = selectPicker;

    function getTime() {
        var h = today.getHours()
            , m = today.getMinutes()

        h = (h < 10 ? '0' : '') + h;
        m = (m < 10 ? '0' : '') + m

        return parseInt(h + m);
    }
    function chkTimeAfter(_timeAfter) {
        var isAfter = false;
        if (_timeAfter != '') {
            if (getTime() >= _timeAfter) {
                isAfter = true;
            }
        }
        return isAfter;
    }

    function chkHoliday(_holiday, _timeAfter) {

        var _addDay = [0, false];

        if (_holiday.startDate != '' && _holiday.endDate != '') {

            var isTimeAfter = chkTimeAfter(_timeAfter);

            if (chkDayInRange(_holiday.startDate, _holiday.endDate)) {

                if (!(parseDate(_holiday.startDate, 'i') == parseDate(today, 'i') && !isTimeAfter)) {
                    _addDay[0] = calDateDiff(today, _holiday.toDate)
                    _addDay[1] = true;
                }

            } else if (isTimeAfter) {

                _addDay[0] = 1

            }
        }

        return _addDay;
    }
    function chkDayInRange(sdate, edate, date) {

        date = date || today;

        var _dt = parseDate(date, 'i')
            , _ds = parseDate(sdate, 'i')
            , _de = parseDate(edate, 'i')
            , v = _dt <= _de && _dt >= _ds

        return v
    }
    function calDateDiff(sdate, edate) {
        // date format => yyyy-mm-dd

        var _dt = parseDate(sdate)
            , _ds = parseDate(sdate, 'i')
            , _de = parseDate(edate, 'i')
            , n = 0

        while (_ds < _de) {

            _dt = _dt.addDays(1);
            _ds = parseDate(_dt, 'i');
            n++;
        }

        return n;
    }

    function parseDate(d, returnType) {

        function d2n(_d) {
            var dd = _d.getDate();
            var mm = _d.getMonth() + 1;

            dd = (dd < 10 ? '0' : '') + dd;
            mm = (mm < 10 ? '0' : '') + mm;

            return parseInt(_d.getFullYear() + mm + dd);
        }

        var _dt = '';
        if (d != '') {
            switch (Object.prototype.toString.call(d)) {
                case '[object Date]':
                    _dt = d;
                    break;
                case '[object String]': // fix only format yyyy-mm-dd
                    var arr = d.split(/\W+/);
                    _dt = new Date(parseInt(arr[0]), parseInt(arr[1]) - 1, parseInt(arr[2]));
                    break;
            }
            _dt = returnType == 'i' ? d2n(_dt) : _dt;
        }
        return _dt;
    }

    window.$selectPicker = window.$selectPicker || {
        ver: '3.1',
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

            new selectPicker(opt);
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

