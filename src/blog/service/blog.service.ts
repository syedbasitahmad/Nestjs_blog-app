import { Injectable } from '@nestjs/common';
import { Observable, of, from } from 'rxjs';
import { BlogEntry } from '../model/blog-entry.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntryEntity } from '../model/blog-entry.entity';
import { Equal, Repository } from 'typeorm';
import { UserService } from 'src/user/service/user.service';
import { User } from 'src/user/models/user.interface';
import { switchMap, map, tap } from 'rxjs/operators';
const slugify = require('slugify');


@Injectable()
export class BlogService {
    constructor(
        @InjectRepository(BlogEntryEntity) private readonly blogRepository: Repository<BlogEntryEntity>,
        private userService: UserService
    ) {}


    create(user: User, blogEntry: BlogEntry): Observable<BlogEntry> {
        blogEntry.author = user;
        console.log(blogEntry);
        return this.generateSlug(blogEntry.title).pipe(
            switchMap((slug: string) => {
                blogEntry.slug = slug;
                return from(this.blogRepository.save(blogEntry));
            })
        )
    }

    findAll(): Observable<BlogEntry[]> {
        return from(this.blogRepository.find());
    }
    
    findOne(id: number): Observable<BlogEntry> {
        return from(this.blogRepository.findOneBy({id}
        
        ));
    }

    findByUser(userId: number): Observable<BlogEntry[]> {
        return from(this.blogRepository.find({
            where: {
                author: Equal(userId)
            },
            relations: ['author']
        })).pipe(map((blogEntries: BlogEntry[]) => blogEntries))
    }

    updateOne(id: number, blogEntry: BlogEntry): Observable<BlogEntry> {
        return from(this.blogRepository.update(id, blogEntry)).pipe(
            switchMap(() => this.findOne(id))
        )
    }

    deleteOne(id: number): Observable<any> {
        return from(this.blogRepository.delete(id));
    }

    generateSlug(title: string): Observable<string> {
        return of(slugify(title));
    }
}
