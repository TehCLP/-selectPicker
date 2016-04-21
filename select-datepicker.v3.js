

(function ($) {

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

        this.day = this.today = new Date();

        this.$day = $(o.idDay);
        this.$month = $(o.idMonth);
        this.$year = $(o.idYear);

        this._lang = o.language;

        this._minDate = parseDate(o.minDate);
        this._maxDate = parseDate(o.maxDate);

        this._timeAfter = (o.timeAfter == '' ? '' : o.timeAfter).replace(/[:\.]/g, '');

        this.o = o;

        this.flag = true;
        this.flagInHoliday = false;

        this.initial();
    }

    selectPicker.prototype = {
        initial: function () {

            var self = this;

            //console.log(self);

            this.fillDate(this.today.getMonth() + 1, this.today.getFullYear(), true, true);

            this.$month.on('change', function () {
                self.changeDate($(this).val(), self.$year.val(), false, false);
            });

            this.$year.on('change', function () {
                self.changeDate(self.$month.val(), $(this).val(), true, false);
            });
        },

        changeDate: function (m, y, flagMonth, flagYear) {
            if (this._lang == 'th') {
                y = y - 543
            }

            this.fillDate(m, y, flagMonth, flagYear);
        },

        fillDate: function (m, y, flagMonth, flagYear) {

            var nAddDay = 0;

            if (this.flag == true)
                nAddDay = chkHoliday(this.o.holiday, this.o.timeAfter)

            if (nAddDay < 1 && chkTimeAfter() && this.flag == false) {
                nAddDay = 1;
            }

            if (this.flag) {
                this.today = this.today.addDays(nAddDay);
                this.flag = false;
            }

            if (flagMonth) {
                this.fillMonth(y);
                m = this.$month.val()
            }

            if (flagYear)
                this.fillYear();

            this.fillDay(m, y);
        },
        fillDay: function (m, y) {
            var dateStart = 1
            , dayInMonth = new Date(y, m, 0).getDate() + 1
            , d = this.$day.val() || ''


            if (this._maxDate != '') {
                if (y == this._maxDate.getFullYear()) {
                    if (m == this._maxDate.getMonth() + 1) {
                        dayInMonth = this._maxDate.getDate() + 1;
                    }
                }
            }

            if (y == this.today.getFullYear() && m == this.today.getMonth() + 1 && this._minDate == '')
                dateStart = this.today.getDate();

            if (this._minDate != '') {
                if (y == this._minDate.getFullYear()) {
                    if (m == this._minDate.getMonth() + 1) {
                        dateStart = this._minDate.getDate();
                    }
                }
            }

            this.$day.empty();
            for (var i = dateStart; i < dayInMonth; i++) {
                this.$day.append('<option value="' + i + '">' + (i) + '</option>').val(i);
            }

            if (d == '') {
                this.$day.val(this.today.getDate());
            } else {
                if (dateStart > d)
                    this.$day.val(dateStart);
                else if (d < dayInMonth)
                    this.$day.val(d);
                else
                    this.$day.val(dayInMonth - 1);
            }
        },
        fillMonth: function (y) {
            var _arrMonth = monthEN
            , monthStart = 1
            , maxMonth = 13
            , mo = this.$month.val() || ''

            if (this._lang == 'th')
                _arrMonth = monthTH;

            if (this._maxDate != '') {
                if (y == this._maxDate.getFullYear())
                    maxMonth = this._maxDate.getMonth() + 1 + 1;
            } 

            if (this._minDate != '') {
                if (y == this._minDate.getFullYear())
                    monthStart = this._minDate.getMonth() + 1;
            } else if (y == this.today.getFullYear()) {
                monthStart = this.today.getMonth() + 1;
            }

            this.$month.empty();
            for (var i = monthStart; i < maxMonth; i++) {
                this.$month.append('<option value="' + i + '">' + _arrMonth[i - 1] + '</option>');
            }

            if (mo == '') {
                this.$month.val(this.today.getMonth() + 1);
            } else {
                if (mo < monthStart)
                    this.$month.val(monthStart);
                else if (mo > maxMonth - 1)
                    this.$month.val(maxMonth - 1)
                else
                    this.$month.val(mo);
            }
        },
        fillYear: function () {
            var yearStart = yearEnd = yearNow = this.today.getFullYear()
            , tmp
            , yy = this.$year.val() || ''

            if (this._minDate != '')
                yearStart = this._minDate.getFullYear();

            if (this._maxDate != '') {
                tmp = this._maxDate.getFullYear() - yearNow + 1;
                yearEnd += tmp;
            } else {
                yearEnd += 2;
            }

            if (this._lang == 'th') {
                yearStart += 543;
                yearEnd += 543
                yearNow += 543;
            }

            this.$year.empty();
            for (var i = yearStart; i < yearEnd; i++) {
                tmp = yearStart++;
                this.$year.append('<option value="' + tmp + '">' + (tmp) + '</option>');
            }

            if (yy == '')
                this.$year.val(yearNow);
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

        var _addDay = 0;

        if (_holiday.startDate != '' && _holiday.endDate != '') {

            var isTimeAfter = chkTimeAfter(_timeAfter);

            if (chkDayInRange(_holiday.startDate, _holiday.endDate)) {

                if (!(parseDate(_holiday.startDate, 'i') == parseDate(today, 'i') && !isTimeAfter)) {
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

        var _dt = parseDate(date, 'i')
            , _ds = parseDate(sdate, 'i')
            , _de = parseDate(edate, 'i')
            , v = _dt <= _de && _dt >= _ds

        return v
    }
    function calDateDiff(sdate, edate) {
        // date format => yyyy-mm-dd

        var _dt = new Date(sdate)
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

