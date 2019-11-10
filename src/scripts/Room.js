import Furniture from "./Furniture"

export default class Room {
    constructor (game, allFurnitures, walls) {
        this.walls = walls
        this.phase = 'neutral'
        this.allFurnitures = allFurnitures
        this.validated = false
    }

    static phases () {
        return ['very_bad', 'bad', 'neutral', 'good']
    }

    static validatePhaseName (phase) {
        if (Room.phases().indexOf(phase) == -1) {
            throw new Error(`${phase} is not a valid room phase name`)
        }
    }

    getAllCorrectFurnitures() {
        return this.walls
        .map(wall => wall.getCorrectFurnitures())
        .reduce((arr1, arr2) => arr1.concat(arr2), [])
    }

    getAllMisplacedFurnitures () {
        return this.walls
        .map(wall => wall.getMisplacedFurnitures())
        .reduce((arr1, arr2) => arr1.concat(arr2), [])
    }

    getAllMissingFurnitures () {
        return this.walls
        .map(wall => wall.getMissingFurnitures())
        .reduce((arr1, arr2) => arr1.concat(arr2), [])
        .filter(furnitureName => !this.getAllMisplacedFurnitures().includes(furnitureName))
    }

    getAllPresentFurnitures () {
        return this.walls
        .map(wall => wall.getPresentFurnitures())
        .reduce((arr1, arr2) => arr1.concat(arr2), [])
    }

    _applyFurnituresMutations () {
        this.getAllMisplacedFurnitures()
        .filter(_ => Math.random() <= Furniture.mutationProbability())
        .forEach(name => {
            console.log('Worsening furniture', name)
            this.allFurnitures[name].worsen()
        })

        this.getAllCorrectFurnitures()
        .filter(_ => Math.random() <= Furniture.mutationProbability())
        .forEach(name => {
            console.log('Improving furniture', name)
            this.allFurnitures[name].improve()
        })
    }

    applyMutations () {
        this._applyFurnituresMutations()
        const theoreticalNbFurnitures = this.walls
        .map(wall => Object.keys(wall.correctFurniturePositions).length)
        .reduce((a, b) => a + b, [])

        const errors = this.getAllMisplacedFurnitures().length + this.getAllMissingFurnitures().length
        const worsenProbability = errors / theoreticalNbFurnitures * 0.5
        if (Math.random() <= worsenProbability) {
            this.worsen()
        }
        if (Object.keys(this.getAllCorrectFurnitures()).length >= theoreticalNbFurnitures) {
            this.improve()
        }
        if (Object.keys(this.getAllCorrectFurnitures()).length >= theoreticalNbFurnitures / 2) {
            this.validated = true
        }
    }

    worsen() {
        const phase = this.phase
        Room.validatePhaseName(this.phase)
        this.phase = Room.phases()[Room.phases().indexOf(this.phase) - 1]
        if (!this.phase) this.phase = phase
    }

    improve() {
        const phase = this.phase
        Room.validatePhaseName(this.phase)
        this.phase = Room.phases()[Room.phases().indexOf(this.phase) + 1]
        if (!this.phase) this.phase = phase
    }


    nextWall (wall) {
        return (wall + this.walls.length + 1) % this.walls.length
    }

    previousWall (wall) {
        return (wall + this.walls.length - 1) % this.walls.length
    }
};
