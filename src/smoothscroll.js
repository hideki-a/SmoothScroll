/*!*
 * Smooth Scroll
 * Version 1.0.1
 * Copyright (c) 2012 Hideki Abe
 *
 * Licensed under the MIT.
 */
/*jslint browser: true, eqeq: false, nomen: true, plusplus: false, maxerr: 100, indent: 4 */
(function (window, document) {
    "use strict";
    function addEvent(elem, type, listener, useCapture) {
        if (elem.addEventListener) {
            elem.addEventListener(type, listener, useCapture);
        } else if (elem.attachEvent) {
            elem.attachEvent("on" + type, listener);
        }
    }

    function removeEvent(elem, type, listener, useCapture) {
        if (elem.removeEventListener) {
            elem.removeEventListener(type, listener, useCapture);
        } else if (elem.dettachEvent) {
            elem.dettachEvent("on" + type, listener);
        }
    }

    function proxy(obj, fn, args) {
        if (!args) {
            args = [null];
        }
        return function () {
            Array.prototype.push.apply(arguments, args);    // See Also http://d.hatena.ne.jp/amachang/20070810/1186779289
            fn.apply(obj, arguments);
        };
    }

    function SmoothScroll(elem) {
        this.elem = elem;
        this.excludeCond = /\#tab_/;
        this.targetId = null;
        this.targetElem = null;
        this.start = 0;
        this.dest = 0;
        this.direction = null;
        this.v = 20;    // The value which influences speed.
    }

    SmoothScroll.prototype = {
        init: function () {
            this.targetId = this.elem.getAttribute("href").replace(/(https?:\/\/[a-zA-Z0-9\.%\/]+)?\#/, "");
            this.targetElem = document.getElementById(this.targetId);
            if (!this.excludeCond.test(this.targetId) && this.targetElem) {
                addEvent(this.elem, "click", proxy(this, function (e) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else if (typeof window.attachEvent === "object") {
                        event.returnValue = false;
                    }
                    this.startScroll();
                }), false);
            }
        },

        startScroll: function () {
            var documentHeight = document.documentElement.scrollHeight,
                viewportHeight = document.documentElement.clientHeight;
            this.start = window.pageYOffset || document.documentElement.scrollTop;
            this.dest = this.targetElem.offsetTop;
            if (documentHeight - viewportHeight < this.dest) {
                this.dest = documentHeight - viewportHeight;
            } else if (this.dest === 0) {
                this.dest = 1;
            }
            this.direction = (this.dest - this.start > 0) ? "down" : "up";
            this.doScroll();
        },

        doScroll: function () {
            var moveY;
            if (this.direction === "up" && this.start > this.dest) {
                moveY = Math.floor(this.start - (this.start - this.dest) / this.v - 1);
                if (moveY <= 1) {
                    moveY = 1;
                }
            } else if (this.direction === "down" && this.dest > this.start) {
                moveY = Math.ceil(this.start + (this.dest - this.start) / this.v + 1);
            } else {
                return;
            }
            window.scrollTo(0, moveY);
            this.start = moveY;
            setTimeout(proxy(this, this.doScroll), 20);
        }
    };

    addEvent(window, "load", function () {
        var instances = [],
            anchors = document.getElementsByTagName("a"),
            nAnchor = anchors.length,
            i,
            href;
        for (i = 0; i < nAnchor; i += 1) {
            href = anchors[i].getAttribute("href");
            if (/\#[a-zA-Z0-9\-_]+$/.test(href)) {
                instances[i] = new SmoothScroll(anchors[i]);
                instances[i].init();
            }
        }
    }, false);
}(window, document));
