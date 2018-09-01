var request = require('request')

describe('calc', () => {
    it( 'should multiply 2 and 2', () => {
        expect(2*2).toBe(4)
    })
})

describe('get messages', () => {
    // won't work unless you specify asyncronous
    // using the argument done
    it('should return 200 OK', (done) => {
        
        request.get('http://localhost:3000/messages', (err, res) => {
            // console.log(res.body)
            expect(res.statusCode).toEqual(200)
            // you must also specify done here when the code finishes
            done()
        })
    })

    it('return a list that is not empty', (done) => {
        
        request.get('http://localhost:3000/messages', (err, res) => {
            // this is actually testing the length of the return string
            // not how many items are in the array, unless you parse it to JSON
            expect(JSON.parse(res.body).length).toBeGreaterThan(0)
            // you must also specify done here when the code finishes
            done()
        })
    })
})

describe('get messages form user', () => {
    it('should return 200 OK', (done) => {
        
        request.get('http://localhost:3000/messages/tim', (err, res) => {
            // console.log(res.body)
            expect(res.statusCode).toEqual(200)
            // you must also specify done here when the code finishes
            done()
        })
    })

    it('name should be tim', (done) => {
        
        request.get('http://localhost:3000/messages/tim', (err, res) => {
            expect(JSON.parse(res.body)[0].name).toEqual('tim')
            done()
        })
    })
})
