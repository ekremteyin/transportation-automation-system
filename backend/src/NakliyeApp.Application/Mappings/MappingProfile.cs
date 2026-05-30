using AutoMapper;
using NakliyeApp.Application.DTOs.User;
using NakliyeApp.Domain.Entities;

namespace NakliyeApp.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(d => d.Role, o => o.MapFrom(s => s.Role.ToString()));
    }
}
