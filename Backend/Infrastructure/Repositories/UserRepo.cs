using Application.Common;
using Application.DTOs;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class UserRepo : IUserRepo
    {
        private readonly AppDbContext _context;
        public UserRepo(AppDbContext context) => _context = context;

        /// <summary>
        /// get user by id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<UserProfile?> GetByIdAsync(Guid id)
        {
            return await _context.UserProfiles.FindAsync(id);
        }

        /// <summary>
        /// add user
        /// </summary>
        /// <param name="profile"></param>
        /// <returns></returns>
        public async Task<UserProfile> AddAsync(UserProfile profile)
        {
            var entry = await _context.UserProfiles.AddAsync(profile);
            await _context.SaveChangesAsync();
            return entry.Entity;
        }

        /// <summary>
        /// update user
        /// </summary>
        /// <param name="profile"></param>
        /// <returns></returns>
        public async Task<UserProfile> UpdateAsync(UserProfile profile)
        {
            var entry = _context.Update(profile);
            await _context.SaveChangesAsync();
            return entry.Entity;
        }

        /// <summary>
        /// update staff role
        /// </summary>
        /// <param name="id"></param>
        /// <param name="newRole"></param>
        /// <returns></returns>
        public async Task<bool> UpdateRoleAsync(Guid id, UserRole newRole)
        {
            var result = await _context.UserProfiles.Where(u => u.IdentityId == id)
                .ExecuteUpdateAsync(setters => setters.SetProperty(u => u.UserRole, newRole));
            return result > 0;
        }


        /// <summary>
        /// delete user
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<bool> DeleteAsync(Guid id)
        {
            var result = await _context.UserProfiles.Where(u => u.IdentityId == id)
                .ExecuteDeleteAsync();
            return result > 0;
        }

        public async Task<PagedResult<UserProfile>> GetPagedStaffAsync(int pageNumber, int pageSize)
        {
            // create a query to sort and count total
            var query = _context.UserProfiles
                .OrderBy(u => u.RegistrationDate);

            var totalCount = await query.CountAsync();

            // select items
            var items = await query
                .Skip(pageNumber - 1 * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<UserProfile>
            {
                Items = items,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }


    }
}
