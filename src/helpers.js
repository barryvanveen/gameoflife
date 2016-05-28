export default class Helpers {

    static getPosition(element) {

        var left = 0,
            top = 0;

        if (element.offsetParent) {
            do {
                left += element.offsetLeft;
                top += element.offsetTop;
            } while (element = element.offsetParent);
        }

        return [left, top];

    };

    static mod(n, m) {
        return ((m % n) + n) % n;
    };

}
