
require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

class LegoData {
    sequelize;
    Set;
    Theme;
 
    constructor() {
        this.sequelize = new Sequelize(
            process.env.PGDATABASE,
            process.env.PGUSER,
            process.env.PGPASSWORD,
            {
                host: process.env.PGHOST,
                dialect: 'postgres',
                port: 5432,
                dialectOptions: {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false,
                    },
                },
            }
        );
 
        this.sequelize
            .authenticate()
            .then(() => console.log('Connection has been established successfully.'))
            .catch((err) => console.error('Unable to connect to the database:', err)); 
       
 
        this.Theme = this.sequelize.define(
            'Theme',
            {
                id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
                name: { type: Sequelize.STRING },
            },
            { timestamps: false }
        );
 
        this.Set = this.sequelize.define(
            'Set',
            {
                set_num: { type: Sequelize.STRING, primaryKey: true, unique: true, allowNull: false},
                name: { type: Sequelize.STRING },
                year: { type: Sequelize.INTEGER },
                num_parts: { type: Sequelize.INTEGER },
                theme_id: { type: Sequelize.INTEGER },
                img_url: { type: Sequelize.STRING },
            },
            { timestamps: false }
        );
 
        this.Set.belongsTo(this.Theme, { foreignKey: 'theme_id' });
    }
 
    initialize() {
        return this.sequelize.sync();
    }
 
    addSet(newSet) {
        return new Promise((resolve, reject) => {
            this.Set.findOne({ where: { set_num: newSet.set_num } })
                .then(existingSet => {
                    if (existingSet) {
                        reject("Set already exists");
                        return;
                    }
   
                    this.Set.create(newSet)
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(err.errors[0].message);
                        });
                })
                .catch((err) => {
                    reject(err.message);
                });
        });
    }
   
   
 
    getAllThemes() {
        return new Promise((resolve, reject) => {
            this.Theme.findAll()
                .then((themes) => {
                    resolve(themes);
                })
                .catch((err) => {
                    reject(err);  
                });
        });
    }
 
    getAllSets() {
        return new Promise((resolve, reject) => {
            this.Set.findAll({
                include: [this.Theme],
            })
                .then((sets) => {
                    if (sets.length > 0) {
                        resolve(sets);
                    } else {
                        reject('Set requested is unavailable');
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
 
    getSetByNum(setNum) {
        return new Promise((resolve, reject) => {
            this.Set.findAll({
                include: [this.Theme],
                where: { set_num: setNum },
            })
                .then((sets) => {
                    if (sets.length > 0) {
                        resolve(sets[0]);
                    } else {
                        reject('Unable to find requested set');
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
 
    getSetsByTheme(theme) {
        return new Promise((resolve, reject) => {
            this.Set.findAll({
                include: [this.Theme],
                where: {
                    '$Theme.name$': {
                        [Sequelize.Op.iLike]: `%${theme}%`,
                    },
                },
            })
                .then((sets) => {
                    if (sets.length > 0) {
                        resolve(sets);
                    } else {
                        reject('Unable to find requested sets');
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
    deleteSetByNum(setNum) {
        return this.Set.destroy({
            where: { set_num: setNum }
        });
    }
}
 
module.exports = LegoData;