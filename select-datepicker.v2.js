

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

        this.today = new Date()

        this.$day = $(o.idDay);
        this.$month = $(o.idMonth);
        this.$year = $(o.idYear);

        this._lang = o.language;

        this._minDate = o.minDate == '' ? '' : new Date(o.minDate);
        this._maxDate = o.maxDate == '' ? '' : new Date(o.maxDate);

        this._timeAfter = (o.timeAfter == '' ? '' : o.timeAfter).replace(/\./g, '');

        this.o = o;

        this.initial();
    }

    selectPicker.prototype = {
        initial: function () {

            var self = this;
            
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
            , nAddDay = chkHoliday(this.o.holiday, this.o.timeAfter)

            if (nAddDay < 1 && chkTimeAfter()) {
                nAddDay = 1;
            }

            this.today = this.today.addDays(nAddDay);


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

            if (this._maxDate != '') {
                if (y == this._maxDate.getFullYear())
                    maxMonth = this._maxDate.getMonth() + 1 + 1;
            }

            if (this._lang == 'th')
                _arrMonth = monthTH;

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

