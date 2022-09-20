import { BlogEntryEntity } from 'src/blog/model/blog-entry.entity';
import { BlogEntry } from 'src/blog/model/blog-entry.interface';
import { Entity,PrimaryGeneratedColumn,Column, BeforeInsert, OneToMany } from 'typeorm';
import { UserRole } from './user.interface';

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true})
    username: string;
    
    @Column({ unique: true})
    email:string;

    @Column()
    password: string;

    @Column({type: 'enum', enum : UserRole , default : UserRole.USER})
    role: UserRole;

    @Column({nullable: true})
    profileImage: string;
    
    @OneToMany(type => BlogEntryEntity, blogEntryEntity => blogEntryEntity.author,
        { cascade: true })
    blogEntries: BlogEntryEntity[];

    @BeforeInsert()
    emailToLowerCase(){
        this.email=this.email.toLowerCase();
    }
}