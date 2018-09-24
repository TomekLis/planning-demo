export class Point {
    id = 0;
    lat = 0;
    lng = 0;
    jobid = '';
    datetime = '';
    address = '';
    eircode = '';
    branch = '';
    branchId = '';
    iconUrl = '';
    card = '';
    confirmed = false;
}

export const points: Point[] = [
    {
        id: 1,
        lat: 52.846723,
        lng: -8.987006,
        jobid: 'JWB000201',
        datetime: '21/06/2017 13:26',
        address: '1 SAINT ANTHONY\'S TERRACE,HARMONY ROW,ENNIS,CO. CLARE',
        eircode: 'V95TN80',
        branch: 'Limerick',
        branchId: 'I07',
        iconUrl: 'assets/van.png',
        card: 'CARD1',
        confirmed: false

    }
];

export const states = ['CARD1', 'CARD2', 'CARD3', 'CARD4', 'CARD5'];
