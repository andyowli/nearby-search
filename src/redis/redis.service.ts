import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {

    @Inject('REDIS_CLIENT') 
    private redisClient: RedisClientType;

    async geoAdd(key: string, posName: string, posLoc: [number, number]) {
        return await this.redisClient.geoAdd(key, {
            longitude: posLoc[0],
            latitude: posLoc[1],
            member: posName
        })
    }

    async geoPos(key: string, posName: string) {
        //用于从给定的 key 里返回所有指定名称(member)的位置（经度和纬度）
        const res = await this.redisClient.geoPos(key, posName);

        return {
            name: posName,
            longitude: res[0].longitude,
            latitude: res[0].latitude
        }
    }

    async geoList(key: string) {
        //zrange 是返回某个分数段的 key，传入 0、-1 就是返回所有的
        const positions = await this.redisClient.zRange(key, 0, -1);

        const list = [];
        for(let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            // console.log(pos);
            //再用 geoPos 拿到它对应的位置信息
            const res = await this.geoPos(key, pos);
            // console.log(res);
            list.push(res);
        }
        return list;
    }

    async geoSearch(key: string, pos: [number, number], radius: number) {
        //以给定的经纬度为中心， 返回键包含的位置元素当中， 与中心的距离不超过给定最大距离的所有位置元素
        const positions = await this.redisClient.geoRadius(key, {
            longitude: pos[0],
            latitude: pos[1]
        }, radius, 'km');
        
        const list = [];
        for(let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            console.log(pos);
            const res = await this.geoPos(key, pos);
            console.log(res);
            list.push(res);
        }
        return list;
    }
}